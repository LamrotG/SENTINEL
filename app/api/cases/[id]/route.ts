import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400 })
    }

    // 1. GET MAIN CASE
    const { data: caseData, error: caseError } = await supabase
      .from('investigation_cases')
      .select('*')
      .eq('id', id)
      .single()

    if (caseError || !caseData) {
      return Response.json({ error: 'Case not found' }, { status: 404 })
    }

    // 2. GET ENTITIES (through junction table)
    const { data: entityLinks } = await supabase
      .from('case_entities')
      .select('entity_id, entities(*)')
      .eq('case_id', id)

    const entities =
      entityLinks?.map((e) => e.entities).filter(Boolean) ?? []

    // 3. GET EVIDENCE
    const { data: evidence } = await supabase
      .from('evidence')
      .select('*')
      .eq('case_id', id)

    // 4. GET TIMELINE
    const { data: timeline } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('case_id', id)
      .order('created_date', { ascending: false })

    // 5. RETURN HYDRATED RESPONSE
    return Response.json({
      case: caseData,
      entities: entities,
      evidence: evidence ?? [],
      timeline: timeline ?? [],
    })
  } catch (error) {
    console.error('Hydration error:', error)
    return Response.json(
      { error: 'Failed to hydrate case' },
      { status: 500 }
    )
  }
}