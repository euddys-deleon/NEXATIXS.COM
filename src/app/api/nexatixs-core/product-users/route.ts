import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Generate temporary password
function generateTemporaryPassword(): string {
  return 'NXT#' + crypto.randomBytes(8).toString('hex').toUpperCase().slice(0, 8);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { license_id, nombre, apellido, email, rol } = body;

    // Validate input
    if (!license_id || !nombre || !apellido || !email) {
      return NextResponse.json(
        { error: 'license_id, nombre, apellido, and email are required' },
        { status: 400 }
      );
    }

    // Get license details
    const { data: license, error: licenseError } = await supabase
      .from('nxt_licenses')
      .select('nxt_client_id, product_id, estado')
      .eq('id', license_id)
      .single();

    if (licenseError || !license) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }

    if (license.estado !== 'activa') {
      return NextResponse.json(
        { error: 'License is not active' },
        { status: 400 }
      );
    }

    // Check user limit
    const { data: userCount, error: countError } = await supabase
      .from('nxt_product_users')
      .select('id', { count: 'exact', head: true })
      .eq('license_id', license_id)
      .eq('estado', 'activo');

    const { data: licenseData } = await supabase
      .from('nxt_licenses')
      .select('usuarios_permitidos, usuarios_actuales')
      .eq('id', license_id)
      .single();

    if (
      licenseData &&
      licenseData.usuarios_actuales >= licenseData.usuarios_permitidos
    ) {
      return NextResponse.json(
        { error: 'User limit reached for this license' },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create product user
    const { data: productUser, error: userError } = await supabase
      .from('nxt_product_users')
      .insert([
        {
          license_id,
          nxt_client_id: license.nxt_client_id,
          product_id: license.product_id,
          nombre,
          apellido,
          email,
          rol: rol || 'user',
          estado: 'pendiente',
          password_temporal: tempPassword,
          password_temporal_expira: expiresAt.toISOString(),
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error('Error creating product user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user', details: userError.message },
        { status: 500 }
      );
    }

    // Update license user count
    await supabase
      .from('nxt_licenses')
      .update({
        usuarios_actuales: (licenseData?.usuarios_actuales || 0) + 1,
        updated_by: user.id,
      })
      .eq('id', license_id);

    // Log action
    await supabase
      .from('nxt_audit_logs')
      .insert([
        {
          nxt_client_id: license.nxt_client_id,
          usuario_id: user.id,
          accion: 'create_product_user',
          entidad: 'nxt_product_users',
          entidad_id: productUser.id,
          resultado: 'success',
          detalles: {
            email: productUser.email,
            rol: productUser.rol,
            license_id,
          },
        },
      ]);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: productUser.id,
          email: productUser.email,
          nombre: productUser.nombre,
          apellido: productUser.apellido,
          rol: productUser.rol,
          estado: productUser.estado,
          password_temporal_expira: productUser.password_temporal_expira,
          created_at: productUser.created_at,
        },
        activation: {
          message: 'User created with temporary password',
          password_hint: `${tempPassword.slice(0, 4)}****${tempPassword.slice(-4)}`,
          expires_in_hours: 24,
          next_step: 'Send email with activation link to user',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const licenseId = searchParams.get('license_id');

    let query = supabase
      .from('nxt_product_users')
      .select(
        `
        id,
        license_id,
        nombre,
        apellido,
        email,
        rol,
        estado,
        2fa_habilitado,
        primer_login,
        ultimo_login,
        created_at,
        nxt_licenses (
          plan,
          tenant_id
        )
      `
      );

    if (licenseId) {
      query = query.eq('license_id', licenseId);
    }

    const { data: users, error: usersError } = await query.order('created_at', {
      ascending: false,
    });

    if (usersError) {
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        total: users?.length || 0,
        users: users || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
