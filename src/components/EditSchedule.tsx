import SchedItem from "../models/SchedItem";

interface Props {
  sched: SchedItem
  schedData: SchedItem
  setSchedData: React.Dispatch<React.SetStateAction<SchedItem>>
  handleEdit: (id: string) => void
  setEdit: React.Dispatch<React.SetStateAction<string>>
}

const EditSchedule = ({sched, schedData, setSchedData, handleEdit, setEdit}: Props) => {
  return (
    <div className='flex flex-col gap'>
      <form onSubmit={()=>handleEdit(sched._id)}>
        <select
          className="mb-2 h-6 shadow-inner ml-7"
          id="leader"
          name="leader"
          value={schedData.leader}
          onChange={(event) => {
            if (event.target) {
              setSchedData({ ...schedData, leader: event.target.value });
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

        <select
          className="mb-2 h-6 shadow-inner ml-7"
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
    
        <select
          className="mb-2 h-6 shadow-inner ml-7"
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

        <select
          className="mb-2 h-6 shadow-inner ml-7"
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
      
        <select
          className="mb-2 h-6 shadow-inner ml-7"
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
      
        <select
          className="mb-2 h-6 shadow-inner ml-7"
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
      
        <select
          className="mb-2 h-6 shadow-inner ml-7"
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
      
        <select
          className="mb-2 h-6 shadow-inner ml-7"
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

        <div className="flex gap-4 ml-2">
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline-green"
            type="submit"
          >
            Done
          </button>
          <button 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:shadow-outline-red"
            onClick={()=>setEdit('')}
          >
            Cancel
          </button>
        </div>
    </form>
  </div>
  )
}

export default EditSchedule