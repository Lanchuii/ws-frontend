import { useState, useEffect } from 'react'
import axios from 'axios'
import SchedItem from '../models/SchedItem'

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
        console.log(scheds)
      })
      .catch(error=>{
        console.log(error);
        setLoading(false)
      });
  }, []);

  return (
    <div>
      { loading ? 'loading' : 
        <div className='grid lg:grid-cols-4 gap-4'>
          {scheds.map(sched=>(
            <div key={sched._id} className='shadow-md rounded-lg p-4'>
              <p>Leader: {sched.leader}</p>
              <p>Acoustic: {sched.acoustic}</p>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

export default Home