import SchedItem from "../../models/SchedItem"
import { MdDelete, MdEdit } from "react-icons/md";
import { FaRegCalendarCheck } from "react-icons/fa";
import EditSchedule from "./EditSchedule";
import { PiMicrophoneStageFill, PiMicrophoneStageLight, PiPianoKeysFill } from "react-icons/pi";
import { FaGuitar } from "react-icons/fa";
import { BiSolidZap } from "react-icons/bi";
import { GiGuitarBassHead } from "react-icons/gi";
import { LiaDrumSolid } from "react-icons/lia";

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
    <div className='shadow-lg rounded-lg'>

      <div key={sched._id} className='flex bg-gray-900 shadow-md text-white p-4 justify-between rounded-tl-lg rounded-tr-lg'>
        <div className="flex items-center gap-2">
          <FaRegCalendarCheck className='text-yellow-400' />
          <p>{formatAndDisplayDate(sched.date)}</p>
        </div>
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

      <div className="flex p-4 bg-gray-200 rounded-bl-lg rounded-br-lg">

        <div className='flex flex-col gap-2 font-bold'>
          <p className="italic">Vocals</p>
          <p className="flex items-center gap-2"><PiMicrophoneStageFill className='text-yellow-700' /><span>Leader:</span></p>
          <p className="flex items-center gap-2"><PiMicrophoneStageLight className='text-yellow-700' /><span>Backup 1:</span></p>
          <p className="flex items-center gap-2"><PiMicrophoneStageLight className='text-yellow-700' /><span>Backup 2:</span></p>
          <p className="italic">Instruments</p>
          <p className="flex items-center gap-2"><FaGuitar className='text-red-700' /><span>Acousitc:</span></p>
          <p className="flex items-center gap-2"><BiSolidZap className='text-red-700' /><span>Electric:</span></p>
          <p className="flex items-center gap-2"><PiPianoKeysFill className='text-red-700' /><span>Keyboard:</span></p>
          <p className="flex items-center gap-2"><GiGuitarBassHead className='text-red-700' /><span>Bass:</span></p>
          <p className="flex items-center gap-2"><LiaDrumSolid className='text-red-700' /><span>Drums:</span></p>
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
          <div className='flex flex-col gap-2 ml-8 font-semibold text-gray-700'>
            <p className="text-gray-200 font-bold">Nice</p>
            <p>{sched.leader}</p>
            <p>{sched.backup1}</p>
            <p>{sched.backup2}</p>
            <p className="text-gray-200">One</p>
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