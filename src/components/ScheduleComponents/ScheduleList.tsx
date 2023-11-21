import SchedItem from '../../models/SchedItem';

import ScheduleCard from './ScheduleCard';

interface Props {
  scheds: SchedItem[]
  edit: string
  setEdit: React.Dispatch<React.SetStateAction<string>>
  schedData: SchedItem
  setSchedData: React.Dispatch<React.SetStateAction<SchedItem>>
  handleDeleteSched: (id: string) => void
  handleEdit: (e: React.FormEvent<HTMLFormElement>, id: string) => void
  permission: boolean
}

const ScheduleList = ({scheds, edit, setEdit, schedData, setSchedData, handleDeleteSched, handleEdit, permission}: Props) => {
  return (
    <div className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-14 mt-10 mx-5'>
      {scheds.map((sched)=>(
        <ScheduleCard
          key={sched._id}
          sched={sched}
          edit={edit}
          setEdit={setEdit}
          schedData={schedData}
          setSchedData={setSchedData}
          handleDeleteSched={handleDeleteSched}
          handleEdit={handleEdit}
          permission={permission}
        />
      ))}
    </div>
  )
}

export default ScheduleList