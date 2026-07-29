export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      _internal_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          channel: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          duration_minutes: number
          executive_id: string
          id: string
          notes: string | null
          prospect_id: string | null
          scheduled_at: string
          status: string
          time_range: unknown
        }
        Insert: {
          channel: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          duration_minutes?: number
          executive_id: string
          id?: string
          notes?: string | null
          prospect_id?: string | null
          scheduled_at: string
          status?: string
          time_range: unknown
        }
        Update: {
          channel?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          duration_minutes?: number
          executive_id?: string
          id?: string
          notes?: string | null
          prospect_id?: string | null
          scheduled_at?: string
          status?: string
          time_range?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "appointments_executive_id_fkey"
            columns: ["executive_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          id: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          id?: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          id?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      client_contacts: {
        Row: {
          can_approve_quotes: boolean
          can_manage_licenses: boolean
          can_open_tickets: boolean
          can_receive_invoices: boolean
          client_id: string
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          position: string | null
          status: string
        }
        Insert: {
          can_approve_quotes?: boolean
          can_manage_licenses?: boolean
          can_open_tickets?: boolean
          can_receive_invoices?: boolean
          client_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          position?: string | null
          status?: string
        }
        Update: {
          can_approve_quotes?: boolean
          can_manage_licenses?: boolean
          can_open_tickets?: boolean
          can_receive_invoices?: boolean
          client_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string
          full_name: string
          id: string
          must_change_password: boolean
          role: string
        }
        Insert: {
          client_id: string
          created_at?: string
          full_name: string
          id: string
          must_change_password?: boolean
          role?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          full_name?: string
          id?: string
          must_change_password?: boolean
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente: {
        Row: {
          clienteId: number
          email: string
          fechaCreacion: string | null
          nombre: string
          telefono: string | null
        }
        Insert: {
          clienteId?: number
          email: string
          fechaCreacion?: string | null
          nombre: string
          telefono?: string | null
        }
        Update: {
          clienteId?: number
          email?: string
          fechaCreacion?: string | null
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          city: string | null
          company_name: string
          company_size: string | null
          contract_start_date: string | null
          country: string | null
          created_at: string
          domain: string | null
          employee_count: number | null
          id: string
          nxt_id: string
          prospect_id: string | null
          rnc: string | null
          sector: string | null
          support_level: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          company_name: string
          company_size?: string | null
          contract_start_date?: string | null
          country?: string | null
          created_at?: string
          domain?: string | null
          employee_count?: number | null
          id?: string
          nxt_id?: string
          prospect_id?: string | null
          rnc?: string | null
          sector?: string | null
          support_level?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          company_name?: string
          company_size?: string | null
          contract_start_date?: string | null
          country?: string | null
          created_at?: string
          domain?: string | null
          employee_count?: number | null
          id?: string
          nxt_id?: string
          prospect_id?: string | null
          rnc?: string | null
          sector?: string | null
          support_level?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: true
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tools: {
        Row: {
          assigned_at: string
          client_id: string
          id: string
          status: string
          tool_id: string
        }
        Insert: {
          assigned_at?: string
          client_id: string
          id?: string
          status?: string
          tool_id: string
        }
        Update: {
          assigned_at?: string
          client_id?: string
          id?: string
          status?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tools_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          status: string
          url: string | null
          version: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          status?: string
          url?: string | null
          version?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          status?: string
          url?: string | null
          version?: string | null
        }
        Relationships: []
      }
      concentracion: {
        Row: {
          abreviatura: string
          concentracionId: number
          nombre: string
        }
        Insert: {
          abreviatura: string
          concentracionId?: number
          nombre: string
        }
        Update: {
          abreviatura?: string
          concentracionId?: number
          nombre?: string
        }
        Relationships: []
      }
      detallePedido: {
        Row: {
          cantidad: number
          detalleId: number
          pedidoId: number
          precioUnitario: number
          subtotal: number
          varianteId: number
        }
        Insert: {
          cantidad: number
          detalleId?: number
          pedidoId: number
          precioUnitario: number
          subtotal: number
          varianteId: number
        }
        Update: {
          cantidad?: number
          detalleId?: number
          pedidoId?: number
          precioUnitario?: number
          subtotal?: number
          varianteId?: number
        }
        Relationships: [
          {
            foreignKeyName: "detallePedido_pedidoId_fkey"
            columns: ["pedidoId"]
            isOneToOne: false
            referencedRelation: "pedido"
            referencedColumns: ["pedidoId"]
          },
          {
            foreignKeyName: "detallePedido_varianteId_fkey"
            columns: ["varianteId"]
            isOneToOne: false
            referencedRelation: "variantePrecio"
            referencedColumns: ["varianteId"]
          },
        ]
      }
      familiaOlfativa: {
        Row: {
          familiaId: number
          nombre: string
          slug: string
        }
        Insert: {
          familiaId?: number
          nombre: string
          slug: string
        }
        Update: {
          familiaId?: number
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      genero: {
        Row: {
          generoId: number
          nombre: string
          slug: string
        }
        Insert: {
          generoId?: number
          nombre: string
          slug: string
        }
        Update: {
          generoId?: number
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          currency: string
          description: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          paid_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          currency?: string
          description: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string
          description?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          assigned_to: string | null
          category: string | null
          client_id: string
          created_at: string
          expires_at: string | null
          id: string
          name: string
          seats: number
          status: string
          usage_percent: number | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          client_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          name: string
          seats?: number
          status: string
          usage_percent?: number | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          client_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          name?: string
          seats?: number
          status?: string
          usage_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      marca: {
        Row: {
          activo: boolean | null
          logoUrl: string | null
          marcaId: number
          nombre: string
          slug: string
        }
        Insert: {
          activo?: boolean | null
          logoUrl?: string | null
          marcaId?: number
          nombre: string
          slug: string
        }
        Update: {
          activo?: boolean | null
          logoUrl?: string | null
          marcaId?: number
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      notaOlfativa: {
        Row: {
          iconoUrl: string | null
          nombre: string
          notaId: number
        }
        Insert: {
          iconoUrl?: string | null
          nombre: string
          notaId?: number
        }
        Update: {
          iconoUrl?: string | null
          nombre?: string
          notaId?: number
        }
        Relationships: []
      }
      ocasion: {
        Row: {
          nombre: string
          ocasionId: number
          slug: string
        }
        Insert: {
          nombre: string
          ocasionId?: number
          slug: string
        }
        Update: {
          nombre?: string
          ocasionId?: number
          slug?: string
        }
        Relationships: []
      }
      pedido: {
        Row: {
          clienteId: number | null
          direccionEnvio: string | null
          estado: string | null
          fechaCreacion: string | null
          metodoPago: string | null
          pedidoId: number
          total: number | null
        }
        Insert: {
          clienteId?: number | null
          direccionEnvio?: string | null
          estado?: string | null
          fechaCreacion?: string | null
          metodoPago?: string | null
          pedidoId?: number
          total?: number | null
        }
        Update: {
          clienteId?: number | null
          direccionEnvio?: string | null
          estado?: string | null
          fechaCreacion?: string | null
          metodoPago?: string | null
          pedidoId?: number
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_clienteId_fkey"
            columns: ["clienteId"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["clienteId"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          annual_price: number | null
          billing_period: string
          category: string
          created_at: string
          currency: string
          description: string | null
          display_order: number
          features: Json
          id: string
          is_featured: boolean
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          annual_price?: number | null
          billing_period?: string
          category: string
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_featured?: boolean
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          annual_price?: number | null
          billing_period?: string
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_featured?: boolean
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      producto: {
        Row: {
          activo: boolean | null
          concentracionId: number | null
          contenidoMlOriginal: number | null
          descripcionCorta: string | null
          descripcionLarga: string | null
          destacado: boolean | null
          fechaActualizacion: string | null
          fechaCreacion: string | null
          generoId: number
          marcaId: number
          nombre: string
          productoId: number
          sku: string | null
          slug: string
        }
        Insert: {
          activo?: boolean | null
          concentracionId?: number | null
          contenidoMlOriginal?: number | null
          descripcionCorta?: string | null
          descripcionLarga?: string | null
          destacado?: boolean | null
          fechaActualizacion?: string | null
          fechaCreacion?: string | null
          generoId: number
          marcaId: number
          nombre: string
          productoId?: number
          sku?: string | null
          slug: string
        }
        Update: {
          activo?: boolean | null
          concentracionId?: number | null
          contenidoMlOriginal?: number | null
          descripcionCorta?: string | null
          descripcionLarga?: string | null
          destacado?: boolean | null
          fechaActualizacion?: string | null
          fechaCreacion?: string | null
          generoId?: number
          marcaId?: number
          nombre?: string
          productoId?: number
          sku?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "producto_concentracionId_fkey"
            columns: ["concentracionId"]
            isOneToOne: false
            referencedRelation: "concentracion"
            referencedColumns: ["concentracionId"]
          },
          {
            foreignKeyName: "producto_generoId_fkey"
            columns: ["generoId"]
            isOneToOne: false
            referencedRelation: "genero"
            referencedColumns: ["generoId"]
          },
          {
            foreignKeyName: "producto_marcaId_fkey"
            columns: ["marcaId"]
            isOneToOne: false
            referencedRelation: "marca"
            referencedColumns: ["marcaId"]
          },
        ]
      }
      productoFamiliaOlfativa: {
        Row: {
          familiaId: number
          productoId: number
        }
        Insert: {
          familiaId: number
          productoId: number
        }
        Update: {
          familiaId?: number
          productoId?: number
        }
        Relationships: [
          {
            foreignKeyName: "productoFamiliaOlfativa_familiaId_fkey"
            columns: ["familiaId"]
            isOneToOne: false
            referencedRelation: "familiaOlfativa"
            referencedColumns: ["familiaId"]
          },
          {
            foreignKeyName: "productoFamiliaOlfativa_productoId_fkey"
            columns: ["productoId"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["productoId"]
          },
        ]
      }
      productoImagen: {
        Row: {
          esPrincipal: boolean | null
          imagenId: number
          orden: number | null
          productoId: number
          textoAlternativo: string | null
          urlWebp: string
        }
        Insert: {
          esPrincipal?: boolean | null
          imagenId?: number
          orden?: number | null
          productoId: number
          textoAlternativo?: string | null
          urlWebp: string
        }
        Update: {
          esPrincipal?: boolean | null
          imagenId?: number
          orden?: number | null
          productoId?: number
          textoAlternativo?: string | null
          urlWebp?: string
        }
        Relationships: [
          {
            foreignKeyName: "productoImagen_productoId_fkey"
            columns: ["productoId"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["productoId"]
          },
        ]
      }
      productoNota: {
        Row: {
          notaId: number
          orden: number | null
          posicion: string
          productoId: number
        }
        Insert: {
          notaId: number
          orden?: number | null
          posicion: string
          productoId: number
        }
        Update: {
          notaId?: number
          orden?: number | null
          posicion?: string
          productoId?: number
        }
        Relationships: [
          {
            foreignKeyName: "productoNota_notaId_fkey"
            columns: ["notaId"]
            isOneToOne: false
            referencedRelation: "notaOlfativa"
            referencedColumns: ["notaId"]
          },
          {
            foreignKeyName: "productoNota_productoId_fkey"
            columns: ["productoId"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["productoId"]
          },
        ]
      }
      productoOcasion: {
        Row: {
          ocasionId: number
          productoId: number
        }
        Insert: {
          ocasionId: number
          productoId: number
        }
        Update: {
          ocasionId?: number
          productoId?: number
        }
        Relationships: [
          {
            foreignKeyName: "productoOcasion_ocasionId_fkey"
            columns: ["ocasionId"]
            isOneToOne: false
            referencedRelation: "ocasion"
            referencedColumns: ["ocasionId"]
          },
          {
            foreignKeyName: "productoOcasion_productoId_fkey"
            columns: ["productoId"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["productoId"]
          },
        ]
      }
      productoTemporada: {
        Row: {
          productoId: number
          temporadaId: number
        }
        Insert: {
          productoId: number
          temporadaId: number
        }
        Update: {
          productoId?: number
          temporadaId?: number
        }
        Relationships: [
          {
            foreignKeyName: "productoTemporada_productoId_fkey"
            columns: ["productoId"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["productoId"]
          },
          {
            foreignKeyName: "productoTemporada_temporadaId_fkey"
            columns: ["temporadaId"]
            isOneToOne: false
            referencedRelation: "temporada"
            referencedColumns: ["temporadaId"]
          },
        ]
      }
      project_status_history: {
        Row: {
          changed_at: string
          id: string
          notes: string | null
          phase: string
          project_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          notes?: string | null
          phase: string
          project_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          notes?: string | null
          phase?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_status_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string
          created_at: string
          estimated_end_date: string | null
          id: string
          name: string
          progress_percent: number
          start_date: string | null
          status: string
        }
        Insert: {
          client_id: string
          created_at?: string
          estimated_end_date?: string | null
          id?: string
          name: string
          progress_percent?: number
          start_date?: string | null
          status: string
        }
        Update: {
          client_id?: string
          created_at?: string
          estimated_end_date?: string | null
          id?: string
          name?: string
          progress_percent?: number
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          category: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          display_id: string
          form_type: string
          id: string
          payload: Json
          pipeline_phase: string
          status: string
        }
        Insert: {
          category: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          display_id: string
          form_type: string
          id?: string
          payload: Json
          pipeline_phase?: string
          status?: string
        }
        Update: {
          category?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          display_id?: string
          form_type?: string
          id?: string
          payload?: Json
          pipeline_phase?: string
          status?: string
        }
        Relationships: []
      }
      services_catalog: {
        Row: {
          created_at: string
          id: string
          is_upsell_eligible: boolean
          item_name: string
          pillar_slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_upsell_eligible?: boolean
          item_name: string
          pillar_slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_upsell_eligible?: boolean
          item_name?: string
          pillar_slug?: string
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          created_at: string
          full_name: string
          id: string
          must_change_password: boolean
          role: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          must_change_password?: boolean
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          must_change_password?: boolean
          role?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          display_id: string
          id: string
          message: string
          status: string
          subject: string
        }
        Insert: {
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          display_id: string
          id?: string
          message: string
          status?: string
          subject: string
        }
        Update: {
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          display_id?: string
          id?: string
          message?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      temporada: {
        Row: {
          nombre: string
          slug: string
          temporadaId: number
        }
        Insert: {
          nombre: string
          slug: string
          temporadaId?: number
        }
        Update: {
          nombre?: string
          slug?: string
          temporadaId?: number
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          is_internal: boolean
          message: string
          staff_author_id: string | null
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          staff_author_id?: string | null
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          staff_author_id?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_staff_author_id_fkey"
            columns: ["staff_author_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string
          client_id: string
          created_at: string
          created_by: string | null
          description: string
          escalated: boolean
          escalated_at: string | null
          first_response_at: string | null
          id: string
          priority: string
          sla_due_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          client_id: string
          created_at?: string
          created_by?: string | null
          description: string
          escalated?: boolean
          escalated_at?: string | null
          first_response_at?: string | null
          id?: string
          priority?: string
          sla_due_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          escalated?: boolean
          escalated_at?: string | null
          first_response_at?: string | null
          id?: string
          priority?: string
          sla_due_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tipoVariante: {
        Row: {
          mlEquivalente: number | null
          nombre: string
          orden: number | null
          tipoVarianteId: number
        }
        Insert: {
          mlEquivalente?: number | null
          nombre: string
          orden?: number | null
          tipoVarianteId?: number
        }
        Update: {
          mlEquivalente?: number | null
          nombre?: string
          orden?: number | null
          tipoVarianteId?: number
        }
        Relationships: []
      }
      upsell_requests: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          item_name: string
          requested_by: string | null
          status: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          item_name: string
          requested_by?: string | null
          status?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          item_name?: string
          requested_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "upsell_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsell_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario: {
        Row: {
          activo: boolean | null
          email: string
          fechaCreacion: string | null
          nombre: string
          passwordHash: string
          rol: string | null
          ultimoAcceso: string | null
          usuarioId: number
        }
        Insert: {
          activo?: boolean | null
          email: string
          fechaCreacion?: string | null
          nombre: string
          passwordHash: string
          rol?: string | null
          ultimoAcceso?: string | null
          usuarioId?: number
        }
        Update: {
          activo?: boolean | null
          email?: string
          fechaCreacion?: string | null
          nombre?: string
          passwordHash?: string
          rol?: string | null
          ultimoAcceso?: string | null
          usuarioId?: number
        }
        Relationships: []
      }
      variantePrecio: {
        Row: {
          activo: boolean | null
          precio: number
          precioComparacion: number | null
          productoId: number
          sku: string | null
          stock: number | null
          tipoVarianteId: number
          varianteId: number
        }
        Insert: {
          activo?: boolean | null
          precio: number
          precioComparacion?: number | null
          productoId: number
          sku?: string | null
          stock?: number | null
          tipoVarianteId: number
          varianteId?: number
        }
        Update: {
          activo?: boolean | null
          precio?: number
          precioComparacion?: number | null
          productoId?: number
          sku?: string | null
          stock?: number | null
          tipoVarianteId?: number
          varianteId?: number
        }
        Relationships: [
          {
            foreignKeyName: "variantePrecio_productoId_fkey"
            columns: ["productoId"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["productoId"]
          },
          {
            foreignKeyName: "variantePrecio_tipoVarianteId_fkey"
            columns: ["tipoVarianteId"]
            isOneToOne: false
            referencedRelation: "tipoVariante"
            referencedColumns: ["tipoVarianteId"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _notify_email: {
        Args: { p_id: string; p_type: string }
        Returns: undefined
      }
      admin_activate_client: {
        Args: {
          p_auth_email: string
          p_company_name: string
          p_contact_full_name: string
          p_prospect_id: string
        }
        Returns: string
      }
      book_appointment: {
        Args: {
          p_channel: string
          p_contact_email: string
          p_contact_name: string
          p_contact_phone: string
          p_duration_minutes?: number
          p_prospect_id: string
          p_scheduled_at: string
        }
        Returns: Json
      }
      can_access_attachment: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: boolean
      }
      clear_must_change_password: { Args: never; Returns: undefined }
      generate_recovery_codes: { Args: never; Returns: string[] }
      redeem_recovery_code: {
        Args: { p_code: string; p_ip: string; p_user_agent: string }
        Returns: Json
      }
      create_prospect: {
        Args: {
          p_category: string
          p_contact_email: string
          p_contact_name: string
          p_contact_phone: string
          p_form_type: string
          p_payload: Json
        }
        Returns: string
      }
      create_support_ticket: {
        Args: {
          p_contact_email: string
          p_contact_name: string
          p_contact_phone: string
          p_message: string
          p_subject: string
        }
        Returns: string
      }
      current_client_id: { Args: never; Returns: string }
      get_prospect_status: { Args: { p_display_id: string }; Returns: Json }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
