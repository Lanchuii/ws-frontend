import { useState, useEffect } from 'react'
import axios from 'axios'
import SchedItem from '../models/SchedItem'
import CreateScheduleModal from '../components/CreateScheduleModal'

const Home = () => {
  const [scheds, setScheds] = useState<SchedItem[]>([])
  const [loading, setLoading] = useState(false)

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
    <div>
      { loading ? 'loading' : 
        <div className='grid lg:grid-cols-5 gap-4'>
          {scheds.map(sched=>(
            <div key={sched._id} className='shadow-lg rounded-lg p-4'>
              <div className='border-b-2'>
                <p>{formatAndDisplayDate(sched.date)}</p>
              </div>
              <div className="flex justify-between pr-20">
                <div className='font-bold'>
                  <p>Leader:</p>
                  <p>Backup 1:</p>
                  <p>Backup 2:</p>
                  <p>Acoustic:</p>
                  <p>Electric:</p>
                  <p>Keyboard:</p>
                  <p>Bass:</p>
                  <p>Drums:</p>
                </div>
                <div>
                <p>{sched.leader}</p>
                <p>{sched.backup1}</p>
                <p>{sched.backup2}</p>
                <p>{sched.acoustic}</p>
                <p>{sched.electric}</p>
                <p>{sched.keyboard}</p>
                <p>{sched.bass}</p>
                <p>{sched.drums}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
      <button>Create New Schedule</button>
      <CreateScheduleModal />
    </div>
  )
}

export default Home