import { useState, useEffect } from 'react'
import axios from 'axios'
import SchedItem from '../models/SchedItem'
import CreateScheduleModal from '../components/CreateScheduleModal'
import { MdDelete, MdEdit } from "react-icons/md";
import EditSchedule from '../components/EditSchedule';

const Home = () => {
  const [scheds, setScheds] = useState<SchedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState<boolean>(false)
  const [edit, setEdit] = useState<string>('')

  const [schedData, setSchedData] = useState<SchedItem>({
    _id: "",
    date: new Date().toISOString().split('T')[0],
    leader: "",
    backup1: "",
    backup2: "",
    acoustic: "",
    electric: "",
    keyboard: "",
    bass: "",
    drums: ""
  })

  useEffect(()=>{
    setLoading(true)
    axios
      .get('http://localhost:3000/schedule/')
      .then(res => {
        setScheds(res.data.data);
        setLoading(false)
      })
      .catch(error=>{
        console.log(error);
        setLoading(false)
      });
  }, []);

  const handleDeleteSched = (id: string) => {
    axios
      .delete(`http://localhost:3000/schedule/${id}`)
      .catch(error=>{
        console.log(error)
      })

      window.location.reload();
  }

  const toggleEdit =(id: string, sched: SchedItem) => {
    setEdit(id)
    setSchedData(sched)

    console.log(sched)
  }

  const handleEdit = (id: string) => {
    axios
      .put(`http://localhost:3000/schedule/${id}`, schedData)
      .catch(error=>{
        console.log(error)
      })
      
      setEdit('')
      window.location.reload();
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
    <div className='p-10'>
      { loading ? 'loading' : 
        <div className='grid lg:grid-cols-4 gap-4'>
          {scheds.map(sched=>(
            <div key={sched._id} className='shadow-lg rounded-lg'>
              <div className='flex bg-gray-800 text-white p-4 border-b-2 justify-between'>
                <p>{formatAndDisplayDate(sched.date)}</p>
                <div className='flex items-center gap-2'>
                <button onClick={()=>toggleEdit(sched._id, sched)}> 
                  <MdEdit className='text-green-600 cursor-pointer'/>
                </button>
                <button onClick={()=>handleDeleteSched(sched._id)}>
                  <MdDelete className='text-red-600 cursor-pointer' />
                </button>
                </div>
              </div>
              <div key={sched._id} className="flex p-4">
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
                    <p>{sched.electric}</p>
                    <p>{sched.keyboard}</p>
                    <p>{sched.bass}</p>
                    <p>{sched.drums}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      }
      <button
        onClick={() => setShowCreate(!showCreate)}
        className="bg-blue-500 mx-auto shadow-md text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
      >
        Create New Schedule
      </button>
      { showCreate ? 
        <CreateScheduleModal showCreate={showCreate} setShowCreate={setShowCreate} /> : ''
      }
    </div>
  )
}

export default Home