import { useState } from 'react'
import axios from 'axios'
import SchedItem from '../models/SchedItem'

interface Props {
  showCreate: boolean
  setShowCreate: React.Dispatch<React.SetStateAction<boolean>>
}

const CreateScheduleModal = ({showCreate, setShowCreate}: Props) => {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/schedule', schedData);

      console.log(response.data); // Handle success
    } catch (error) {
      console.error('Error submitting form:', error); // Handle error
    }
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-1/2">
        <div className="flex justify-between">
          <h2 className="text-2xl font-semibold">New Schedule</h2>
          <button 
            onClick={()=>setShowCreate(!showCreate)}
          >
            X
          </button>
        </div>  
        <form onSubmit={handleSubmit} className='flex flex-col w-3/4 mx-auto mt-4'>
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
              className='w-3/4 px-3 py-2 border m-auto rounded-md focus:outline-none focus:border-blue-500'
            />
          <h2 className='font-bold text-lg mt-4 m-auto'>Vocals</h2>
            <label htmlFor='leader' className="font-bold">Leader  </label>
            <select
                className='border-2 shadow-inner'
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
              <option value=" --- none --- ">Select an option</option>
              <option value="Peter">Peter</option>
              <option value="Caye">Caye</option>
              <option value="Joshua">Joshua</option>
              <option value="Mel">Mel</option>
              <option value="Nina">Nina</option>
              <option value="Cutie">Cutie</option>
          </select>
          
            <label htmlFor='backup 1' className="font-bold">Backup 1  </label>
            <select
                className='border-2 shadow-inner'
                id="backup1"
                name="backup1"
                value={schedData.backup1}
                onChange={(event) => {
                  if (event.target) {
                    setSchedData({ ...schedData, backup1: event.target.value });
                  }
                }}
            >
              <option value=" --- none --- ">Select an option</option>
              <option value="Peter">Peter</option>
              <option value="Caye">Caye</option>
              <option value="Joshua">Joshua</option>
              <option value="Mel">Mel</option>
              <option value="Nina">Nina</option>
              <option value="Cutie">Cutie</option>
              <option value="Veth">Veth</option>
              <option value="Boyet">Boyet</option>
            </select>
          
            <label htmlFor='backup2' className="font-bold">Backup 2  </label>
            <select
                className='border-2 shadow-inner'
                id="backup2"
                name="backup2"
                value={schedData.backup2}
                onChange={(event) => {
                  if (event.target) {
                    setSchedData({ ...schedData, backup2: event.target.value });
                  }
                }}  
            >
              <option value=" --- none --- ">Select an option</option>
              <option value="Peter">Peter</option>
              <option value="Caye">Caye</option>
              <option value="Joshua">Joshua</option>
              <option value="Mel">Mel</option>
              <option value="Nina">Nina</option>
              <option value="Cutie">Cutie</option>
              <option value="Veth">Veth</option>
              <option value="Boyet">Boyet</option>
            </select>

          <h2 className='font-bold text-lg mt-4 m-auto'>Instuments</h2>
          
            <label htmlFor='acoustic' className="font-bold">Acoustic  </label>
            <select
                className='border-2 shadow-inner'
                id="acoustic"
                name="acoustic"
                value={schedData.acoustic}
                onChange={(event) => {
                  if (event.target) {
                    setSchedData({ ...schedData, acoustic: event.target.value });
                  }
                }}
            >
                <option value=" --- none --- ">Select an option</option>
                <option value="Peter">Peter</option>
                <option value="Joshua">Joshua</option>
                <option value="Mathew">Mathew</option>
            </select>
          
            <label htmlFor='electric' className="font-bold">Electric  </label>
            <select
                className='border-2 shadow-inner'
                id="electric"
                name="electric"
                value={schedData.electric}
                onChange={(event) => {
                  if (event.target) {
                    setSchedData({ ...schedData, electric: event.target.value });
                  }
                }}
            >
                <option value=" --- none --- ">Select an option</option>
                <option value="Aaron">Aaron</option>
                <option value="Joel">Joel</option>
                <option value="Lanz">Lanz</option>
            </select>
          
            <label htmlFor='keyboard' className="font-bold">Keyboard  </label>
            <select
                className='border-2 shadow-inner'
                id="keyboard"
                name="keyboard"
                value={schedData.keyboard}
                onChange={(event) => {
                  if (event.target) {
                    setSchedData({ ...schedData, keyboard: event.target.value });
                  }
                }}
            >
                <option value=" --- none --- ">Select an option</option>
                <option value="Renz">Renz</option>
                <option value="Jacob">Jacob</option>
            </select>
          
            <label htmlFor='bass' className="font-bold">Bass  </label>
            <select
                className='border-2 shadow-inner'
                id="bass"
                name="bass"
                value={schedData.bass}
                onChange={(event) => {
                  if (event.target) {
                    setSchedData({ ...schedData, bass: event.target.value });
                  }
                }}
            >
                <option value=" --- none --- ">Select an option</option>
                <option value="Elton">Elton</option>
                <option value="Lanz">Lanz</option>
            </select>
          
            <label htmlFor='drums' className="font-bold">Drums  </label>
            <select
                className='border-2 shadow-inner'
                id="drums"
                name="drums"
                value={schedData.drums}
                onChange={(event) => {
                  if (event.target) {
                    setSchedData({ ...schedData, drums: event.target.value });
                  }
                }}
            >
                <option value=" --- none --- ">Select an option</option>
                <option value="Popoy">Popoy</option>
                <option value="Leigh">Leigh</option>
                <option value="Jacob">Jacob</option>
            </select>
          <div className='flex mb-6'>
            <button
              type='submit'
              className='w-full bg-blue-500 text-white mt-4 py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue'
            >
              CREATE
            </button>
          </div>
        </form>
      </div>
   </div>
  )
}

export default CreateScheduleModal