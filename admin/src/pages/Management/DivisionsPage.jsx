import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardBody, Loading } from '../../components/Common'
import './Management.css'

export default function DivisionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => import('../../api/endpoints').then(m => m.divisionsAPI.listDivisions()),
  })

  if (isLoading) return <Loading />

  return (
    <div className="management">
      <div className="management__header">
        <div>
          <h1>Divisions Management</h1>
          <p>Manage academic divisions and classes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <p>Division List</p>
        </CardHeader>
        <CardBody>
          <div className="management__grid">
            {data?.data?.map((division) => (
              <div key={division.id} className="management__card">
                <div className="management__card-title">{division.name}</div>
                <div className="management__card-description">{division.description || 'No description'}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
