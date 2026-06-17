import { PageHeader } from '@/components/page-header'
import { EntityIntelligence } from '@/components/entity-intelligence'

export default function EntitiesPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Entity Intelligence"
        description="Profiles, risk scoring, and relationship mapping across all tracked entities"
      />
      <div className="min-h-0 flex-1">
        <EntityIntelligence />
      </div>
    </div>
  )
}
