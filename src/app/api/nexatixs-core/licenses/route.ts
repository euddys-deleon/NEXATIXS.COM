import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify superadmin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      nxt_client_id,
      product_id,
      plan,
      usuarios_permitidos,
      fecha_inicio,
      fecha_vencimiento,
    } = body;

    // Validate input
    if (!nxt_client_id || !product_id || !plan) {
      return NextResponse.json(
        { error: 'nxt_client_id, product_id, and plan are required' },
        { status: 400 }
      );
    }

    // Use NXT-ID as tenant_id for multi-tenancy
    const { data: client, error: clientError } = await supabase
      .from('nxt_master_clients')
      .select('nxt_id')
      .eq('id', nxt_client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Create license
    const { data: license, error: licenseError } = await supabase
      .from('nxt_licenses')
      .insert([
        {
          nxt_client_id,
          product_id,
          plan,
          estado: 'activa',
          usuarios_permitidos: usuarios_permitidos || 1,
          usuarios_actuales: 0,
          tenant_id: client.nxt_id, // NXT-ID becomes the tenant identifier
          fecha_inicio,
          fecha_vencimiento,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (licenseError) {
      console.error('Error creating license:', licenseError);
      return NextResponse.json(
        { error: 'Failed to create license', details: licenseError.message },
        { status: 500 }
      );
    }

    // Log action
    await supabase
      .from('nxt_audit_logs')
      .insert([
        {
          nxt_client_id,
          usuario_id: user.id,
          accion: 'create_license',
          entidad: 'nxt_licenses',
          entidad_id: license.id,
          resultado: 'success',
          detalles: {
            plan: license.plan,
            tenant_id: license.tenant_id,
            product_id: license.product_id,
          },
        },
      ]);

    // Trigger provisioning job (async)
    const { data: product } = await supabase
      .from('nxt_products')
      .select('slug')
      .eq('id', product_id)
      .single();

    if (product) {
      await supabase
        .from('nxt_provisioning_jobs')
        .insert([
          {
            license_id: license.id,
            producto_slug: product.slug,
            estado: 'pending',
            acciones_pendientes: [
              `create_tenant:${client.nxt_id}`,
              `create_admin_user`,
              `send_welcome_email`,
            ],
          },
        ]);
    }

    return NextResponse.json(
      {
        success: true,
        license: {
          id: license.id,
          nxt_client_id: license.nxt_client_id,
          product_id: license.product_id,
          plan: license.plan,
          tenant_id: license.tenant_id,
          estado: license.estado,
          usuarios_permitidos: license.usuarios_permitidos,
          created_at: license.created_at,
        },
        provisioning: {
          status: 'pending',
          message: 'Provisioning job created - product will be ready shortly',
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
    const clientId = searchParams.get('client_id');

    let query = supabase
      .from('nxt_licenses')
      .select(
        `
        id,
        nxt_client_id,
        product_id,
        plan,
        estado,
        usuarios_permitidos,
        usuarios_actuales,
        tenant_id,
        fecha_inicio,
        fecha_vencimiento,
        created_at,
        nxt_master_clients (
          nxt_id,
          razon_social
        ),
        nxt_products (
          nombre,
          slug,
          icono
        )
      `
      );

    if (clientId) {
      query = query.eq('nxt_client_id', clientId);
    }

    const { data: licenses, error: licensesError } = await query.order(
      'created_at',
      { ascending: false }
    );

    if (licensesError) {
      return NextResponse.json(
        { error: 'Failed to fetch licenses', details: licensesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        total: licenses?.length || 0,
        licenses: licenses || [],
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
