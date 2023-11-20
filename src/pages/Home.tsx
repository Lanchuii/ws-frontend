import { useState, useEffect } from 'react'
import axios from 'axios'
import SchedItem from '../models/SchedItem'
import ScheduleList from '../components/ScheduleComponents/ScheduleList';
import CreateScheduleModal from '../components/ScheduleComponents/CreateScheduleModal';
import PermissionModal from '../components/ScheduleComponents/PermissionModal';

const Home = () => {
  const URL = import.meta.env.VITE_REACT_APP_API_URL

  const [scheds, setScheds] = useState<SchedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState<boolean>(false)
  const [edit, setEdit] = useState<string>('')

  const [permissionModal, setPermissionModal] = useState(false)
  const [permission, setPermission] = useState(false)

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
      .get(`${URL}/schedule/`)
      .then(res => {
        setScheds(res.data.data);
        setLoading(false)
      })
      .catch(error=>{
        console.log(error);
        setLoading(false)
      });
  }, [edit, schedData]);

  const updateScheduleList = () => {
    setLoading(true);
    axios
      .get(`${URL}/schedule/`)
      .then((res) => {
        setScheds(res.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const handleDeleteSched = (id: string) => {
    axios
      .delete(`${URL}/schedule/${id}`)
      .then(()=>{
        setScheds((prevScheds) =>
          prevScheds.filter((sched) => sched._id !== id)
      );
      })
      .catch(error=>{
        console.log(error)
      })

  }

  const handleEdit = (id: string) => {
    axios
      .put(`${URL}/schedule/${id}`, schedData)
      .catch(error=>{
        console.log(error)
      })
      
      setEdit('')
  }

  return (
    <div className='mt-8 sm:mx-10 lg:mx-20'>
      <div className='flex justify-between'>
        <h1 className='mb-5 text-5xl font-bold text-yellow-600'>Main</h1>
        <button
          onClick={() => setPermissionModal(!permissionModal)}
          className="bg-yellow-400 text-gray-900 font-bold shadow-md mt-2 mb-8 py-2 px-4 rounded-md hover:bg-gray-900 hover:text-white focus:outline-none focus:shadow-outline-blue"
        >
          Set Schedules
        </button>
      </div>
      { loading ? 'loading' : 
        <ScheduleList
          scheds={scheds}
          edit={edit}
          setEdit={setEdit}
          schedData={schedData}
          setSchedData={setSchedData}
          handleDeleteSched={handleDeleteSched}
          handleEdit={handleEdit}
          permission={permission}
        />
      }
      { permissionModal ? 
        <PermissionModal
          permissionModal={permissionModal}
          setPermissionModal={setPermissionModal}
          setPermission={setPermission}
        /> : ''
      }
      { permission ? 
        <div className='flex justify-center mt-10'>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-yellow-400 text-gray-900 font-bold shadow-md mb-10 py-2 px-4 rounded-md hover:bg-gray-900 hover:text-white focus:outline-none focus:shadow-outline-blue"
          >
            Create New Schedule
          </button>
          { showCreate ? 
            <CreateScheduleModal 
              URL={URL}
              showCreate={showCreate} 
              setShowCreate={setShowCreate}
              updateScheduleList={updateScheduleList}
            /> : ''
          }
        </div> : ''}
    </div>
  )
}

export default Home