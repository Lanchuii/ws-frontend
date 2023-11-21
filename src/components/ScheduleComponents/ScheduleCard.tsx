import SchedItem from "../../models/SchedItem"
import { MdDelete, MdEdit } from "react-icons/md";
import EditSchedule from "./EditSchedule";

interface Props {
  sched: SchedItem
  edit: string
  setEdit: React.Dispatch<React.SetStateAction<string>>
  schedData: SchedItem
  setSchedData: React.Dispatch<React.SetStateAction<SchedItem>>
  handleDeleteSched: (id: string) => void
  handleEdit: (e: React.FormEvent<HTMLFormElement>, id: string) => void
  permission: boolean
}

const ScheduleCard = ({sched, edit, setEdit, schedData, setSchedData, handleDeleteSched, handleEdit, permission}: Props) => {
  const toggleEdit =(id: string, sched: SchedItem) => {
    setEdit(id)
    setSchedData(sched)
  }

  const formatAndDisplayDate = (dateString: any) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
    return formattedDate;
  };
  
  return (
    <div className='shadow-lg rounded-lg bg-gray-100'>

          <div key={sched._id} className='flex bg-gray-900 shadow-md text-white p-4 border-b-2 justify-between'>
            <p>{formatAndDisplayDate(sched.date)}</p>

            { permission ? (
              <div className='flex items-center gap-2'>
                <button onClick={()=>toggleEdit(sched._id, sched)}> 
                  <MdEdit className='text-green-600 cursor-pointer'/>
                </button>
                <button onClick={()=>handleDeleteSched(sched._id)}>
                  <MdDelete className='text-red-600 cursor-pointer' />
                </button>
              </div>
              ) : ''
            }
            
          </div>

          <div className="flex p-4">

            <div className='flex flex-col gap-2 font-bold'>
              <p>Leader:</p>
              <p>Backup 1:</p>
              <p>Backup 2:</p>
              <p>Acoustic:</p>
              <p>Electric:</p>
              <p>Keyboard:</p>
              <p>Bass:</p>
              <p>Drums:</p>
            </div>

            { edit === sched._id ? (
              <EditSchedule 
                sched={sched}
                schedData={schedData}
                setSchedData={setSchedData}
                handleEdit={handleEdit}
                setEdit={setEdit}
              />
            ) : (
              <div className='flex flex-col gap-2 ml-8'>
                <p>{sched.leader}</p>
                <p>{sched.backup1}</p>
                <p>{sched.backup2}</p>
                <p>{sched.acoustic}</p>
                {sched.electric ? <p>{sched.electric}</p> : <p>--none--</p>}
                {sched.keyboard ? <p>{sched.keyboard}</p> : <p>--none--</p>}
                <p>{sched.bass}</p>
                <p>{sched.drums}</p>
              </div>
            )}
          </div>
        </div>
  )
}

export default ScheduleCard