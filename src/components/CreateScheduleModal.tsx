import { useState } from 'react'
import axios from 'axios'
import SchedItem from '../models/SchedItem'

const CreateScheduleModal = () => {
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
      // Assuming your Express server is running on http://localhost:3001
      const response = await axios.post('http://localhost:3000/schedule', schedData);

      console.log(response.data); // Handle success
    } catch (error) {
      console.error('Error submitting form:', error); // Handle error
      console.log(schedData)
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col w-25 align-items-center'>
      <div className='flex'>
      <label htmlFor="date">Date: </label>
        <input
          type="date"
          id="datePicker"
          value={schedData.date} // Format as 'YYYY-MM-DD'
          onChange={(event) => {
            if (event.target) {
              setSchedData({ ...schedData, date: event.target.value });
              console.log(schedData)

            }
          }}
        />
      </div>
      <h2 className='font-bold'>Vocals</h2>
      <div className='flex'>
        <label htmlFor='leader' className="font-bold">Leader  </label>
        <select
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
      </div>
      <div className='flex'>
        <label htmlFor='backup 1' className="font-bold">Backup 1  </label>
        <select
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
        </select>
      </div>
      <div className='flex'>
        <label htmlFor='backup2' className="font-bold">Backup 2  </label>
        <select
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
        </select>
      </div>

      <h2 className='font-bold'>Instuments</h2>
      <div className='flex'>
        <label htmlFor='acoustic' className="font-bold">Acoustic  </label>
        <select
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
      </div>
      <div className='flex'>
        <label htmlFor='electric' className="font-bold">Electric  </label>
        <select
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
      </div>
      <div className='flex'>
        <label htmlFor='keyboard' className="font-bold">Keyboard  </label>
        <select
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
      </div>
      <div className='flex'>
        <label htmlFor='bass' className="font-bold">Bass  </label>
        <select
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
      </div>
      <div className='flex'>
        <label htmlFor='drums' className="font-bold">Drums  </label>
        <select
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
      </div>
      <button type='submit'>CREATE</button>
    </form>
  )
}

export default CreateScheduleModal