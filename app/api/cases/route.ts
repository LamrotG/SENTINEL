import { supabase } from '@/lib/supabase'
import type { InvestigationCase } from '@/lib/type'

// GET all cases
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('investigation_cases')
      .select('*')
      .order('created_date', { ascending: false })

    if (error) {
      console.error('Supabase GET error:', error)
      return Response.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      )
    }

    return Response.json(data ?? [])
  } catch (error) {
    console.error('Server error:', error)
    return Response.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    )
  }
}

// POST new case
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('investigation_cases')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Supabase INSERT error:', error)
      return Response.json(
        { error: 'Failed to create case' },
        { status: 500 }
      )
    }

    return Response.json(data, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return Response.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    )
  }
}