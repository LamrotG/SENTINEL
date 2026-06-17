import { PageHeader } from '@/components/page-header'
import { ReportBuilder } from '@/components/report-builder'

export default function ReportsPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Report Builder"
        description="Assemble court-ready investigation reports from case artifacts"
      />
      <div className="min-h-0 flex-1">
        <ReportBuilder />
      </div>
    </div>
  )
}
