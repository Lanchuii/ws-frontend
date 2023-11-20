import { useState } from 'react'
import axios from 'axios'
import SchedItem from '../../models/SchedItem'
import { IoIosArrowDroprightCircle, IoIosArrowDropleftCircle } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

interface Props {
  showCreate: boolean
  setShowCreate: React.Dispatch<React.SetStateAction<boolean>>
  updateScheduleList: () => void
}

const CreateScheduleModal = ({showCreate, setShowCreate, updateScheduleList}: Props) => {
  const [currentPage, setCurrentPage] = useState(1)
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

  const handlePage = (currPage: number) => {
    if(currPage === 1){
      setCurrentPage(currPage+1)
    } else if(currPage === 2) {
      setCurrentPage(currPage - 1)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try { 
      const response = await axios.post('http://localhost:3000/schedule', schedData);

      console.log(response.data); // Handle success

      setShowCreate(false)
      updateScheduleList()
    } catch (error) {
      console.error('Error submitting form:', error); // Handle error
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md lg:w-1/2 sm:w-3/4">
        <div className="flex justify-between">
          <h2 className="text-yellow-400 text-2xl font-bold">New Schedule</h2>
          <button 
            onClick={()=>setShowCreate(!showCreate)}
          >
            <RxCross2 />
          </button>
        </div>
        <form onSubmit={handleSubmit} className='flex flex-col lg:w-3/4 mx-auto mt-4'>
          { currentPage == 1 ? (
            <div className='flex flex-col lg:w-3/4 mx-auto'>
            <label htmlFor="date" className='font-bold text-lg m-auto'>Date:</label>
            <input
              type="date"
              id="datePicker"
              value={schedData.date} // Format as 'YYYY-MM-DD'
              onChange={(event) => {
                if (event.target) {
                  setSchedData({ ...schedData, date: event.target.value });
                }
              }}
              className='text-black text-center w-3/4 border m-auto rounded-md focus:outline-none focus:border-blue-500'
            />
            <h2 className='font-bold text-lg mt-3 m-auto'>Vocals</h2>
              <label htmlFor='leader' className="font-bold">Leader:  </label>
              <select
                  className='text-black border-2 shadow-inner'
                  id="leader"
                  name="leader"
                  value={schedData.leader}
                  onChange={(event) => {
                    if (event.target) {
                      setSchedData({ ...schedData, leader: event.target.value });
                      console.log(schedData)
                    }
                  }}
              >
                <option value="">Select an option</option>
                <option value="Peter">Peter</option>
                <option value="Caye">Caye</option>
                <option value="Joshua">Joshua</option>
                <option value="Mel">Mel</option>
                <option value="Nina">Nina</option>
                <option value="Cutie">Cutie</option>
            </select>
            
              <label htmlFor='backup 1' className="font-bold">Backup 1:  </label>
              <select
                  className='text-black border-2 shadow-inner'
                  id="backup1"
                  name="backup1"
                  value={schedData.backup1}
                  onChange={(event) => {
                    if (event.target) {
                      setSchedData({ ...schedData, backup1: event.target.value });
                    }
                  }}
              >
                <option value="">Select an option</option>
                <option value="Peter">Peter</option>
                <option value="Caye">Caye</option>
                <option value="Joshua">Joshua</option>
                <option value="Mel">Mel</option>
                <option value="Nina">Nina</option>
                <option value="Cutie">Cutie</option>
                <option value="Veth">Veth</option>
                <option value="Boyet">Boyet</option>
                <option value="Elaisha">Elaisha</option>
              </select>
            
              <label htmlFor='backup2' className="font-bold">Backup 2:  </label>
              <select
                  className='text-black border-2 shadow-inner'
                  id="backup2"
                  name="backup2"
                  value={schedData.backup2}
                  onChange={(event) => {
                    if (event.target) {
                      setSchedData({ ...schedData, backup2: event.target.value });
                    }
                  }}  
              >
                <option value="">Select an option</option>
                <option value="Peter">Peter</option>
                <option value="Caye">Caye</option>
                <option value="Joshua">Joshua</option>
                <option value="Mel">Mel</option>
                <option value="Nina">Nina</option>
                <option value="Cutie">Cutie</option>
                <option value="Veth">Veth</option>
                <option value="Boyet">Boyet</option>
                <option value="Elaisha">Elaisha</option>
              </select>
              <button
                type='button'
                onClick={()=>handlePage(currentPage)}
                className='bg-yellow-400 text-gray-900 text-center py-1 px-2 mt-4 mx-auto rounded'
              >
                <IoIosArrowDroprightCircle /> 
              </button>
            </div>
          ) : ''}
          { currentPage === 2 ? (
            <div className='flex flex-col lg:w-3/4 mx-auto'>
            <div className='mt-3 m-auto'>
              <h2 className='font-bold text-lg  text-center'>Instuments</h2>
              <div className='flex gap-2 text-white'>
                <button
                  type="button"
                  className="bg-gray-800 p-1 rounded"
                  onClick={(event) => {
                    event.preventDefault(); 
                    setSchedData({
                      ...schedData,
                      acoustic: "Peter",
                      electric: "Aaron",
                      keyboard: "Renz",
                      bass: "Lanz",
                      drums: "Popoy"
                    });
                  }}
                >
                  Band A
                </button>
                <button
                  type="button"
                  className="bg-gray-800 p-1 rounded"
                  onClick={(event) => {
                    event.preventDefault(); 
                    setSchedData({
                      ...schedData,
                      acoustic: "Mathew",
                      electric: "Joel",
                      keyboard: "Jacob",
                      bass: "Elton",
                      drums: "Leigh"
                    });
                  }}
                >
                  Band B
                </button>
              </div>
            </div>
            
              <label htmlFor='acoustic' className="font-bold">Acoustic:  </label>
              <select
                  className='text-black border-2 shadow-inner'
                  id="acoustic"
                  name="acoustic"
                  value={schedData.acoustic}
                  onChange={(event) => {
                    if (event.target) {
                      setSchedData({ ...schedData, acoustic: event.target.value });
                    }
                  }}
              >
                  <option value="">Select an option</option>
                  <option value="Peter">Peter</option>
                  <option value="Joshua">Joshua</option>
                  <option value="Mathew">Mathew</option>
              </select>
            
              <label htmlFor='electric' className="font-bold">Electric:  </label>
              <select
                  className='text-black border-2 shadow-inner'
                  id="electric"
                  name="electric"
                  value={schedData.electric}
                  onChange={(event) => {
                    if (event.target) {
                      setSchedData({ ...schedData, electric: event.target.value });
                    }
                  }}
              >
                  <option value="">Select an option</option>
                  <option value="Aaron">Aaron</option>
                  <option value="Joel">Joel</option>
                  <option value="Lanz">Lanz</option>
              </select>
            
              <label htmlFor='keyboard' className="font-bold">Keyboard:  </label>
              <select
                  className='text-black border-2 shadow-inner'
                  id="keyboard"
                  name="keyboard"
                  value={schedData.keyboard}
                  onChange={(event) => {
                    if (event.target) {
                      setSchedData({ ...schedData, keyboard: event.target.value });
                    }
                  }}
              >
                  <option value="">Select an option</option>
                  <option value="Renz">Renz</option>
                  <option value="Jacob">Jacob</option>
              </select>
            
              <label htmlFor='bass' className="font-bold">Bass:  </label>
              <select
                  className='text-black border-2 shadow-inner'
                  id="bass"
                  name="bass"
                  value={schedData.bass}
                  onChange={(event) => {
                    if (event.target) {
                      setSchedData({ ...schedData, bass: event.target.value });
                    }
                  }}
              >
                  <option value="">Select an option</option>
                  <option value="Elton">Elton</option>
                  <option value="Lanz">Lanz</option>
              </select>
            
              <label htmlFor='drums' className="font-bold">Drums:  </label>
              <select
                  className='text-black border-2 shadow-inner'
                  id="drums"
                  name="drums"
                  value={schedData.drums}
                  onChange={(event) => {
                    if (event.target) {
                      setSchedData({ ...schedData, drums: event.target.value });
                    }
                  }}
              >
                  <option value="">Select an option</option>
                  <option value="Popoy">Popoy</option>
                  <option value="Leigh">Leigh</option>
                  <option value="Jacob">Jacob</option>
              </select>
              <button
                type='button'
                onClick={()=>handlePage(currentPage)}
                className='bg-yellow-400 text-gray-900 text-center py-1 px-2 mt-4 mx-auto rounded'
              >
                <IoIosArrowDropleftCircle /> 
              </button>
              <div className='flex mb-6'>
                <button
                  type='submit'
                  className='w-full bg-yellow-400 text-gray-900 font-bold mt-4 py-2 px-4 rounded-md hover:bg-gray-600 hover:text-white focus:outline-none focus:shadow-outline-blue'
                >
                  CREATE
                </button>
              </div>
            </div>
          ) : ''}
        </form>
      </div>
   </div>
  )
}

export default CreateScheduleModal