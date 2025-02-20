import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaTree, FaCloudSun, FaWater, FaSeedling, FaLeaf } from 'react-icons/fa';
import { RiMentalHealthLine, RiHeartPulseLine, RiMoonClearLine } from 'react-icons/ri';

const WellnessGarden = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [gardenData, setGardenData] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [weather, setWeather] = useState('sunny'); // sunny, rainy, cloudy

  useEffect(() => {
    const fetchGardenData = async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const data = userDoc.data();
      setGardenData({
        mental: data.mental_health,
        physical: data.physical_health,
        sleep: data.sleep,
        stress: data.stress,
        activities: data.activities || []
      });

      // Set weather based on overall wellness
      const wellnessScore = calculateWellnessScore(data);
      setWeather(wellnessScore > 75 ? 'sunny' : wellnessScore > 50 ? 'cloudy' : 'rainy');
    };

    fetchGardenData();
  }, [currentUser]);

  const gardenElements = {
    mentalHealth: {
      icon: RiMentalHealthLine,
      title: 'Wisdom Tree',
      description: 'A majestic tree representing mental clarity and emotional balance',
      color: 'from-purple-500 to-indigo-600'
    },
    physicalHealth: {
      icon: RiHeartPulseLine,
      title: 'Vitality Pond',
      description: 'Crystal clear waters reflecting physical wellbeing',
      color: 'from-blue-500 to-cyan-600'
    },
    sleep: {
      icon: RiMoonClearLine,
      title: 'Dream Flowers',
      description: 'Gentle blooms that open with quality rest',
      color: 'from-indigo-400 to-purple-500'
    },
    stress: {
      icon: FaLeaf,
      title: 'Zen Garden',
      description: 'A peaceful sanctuary for stress relief',
      color: 'from-green-400 to-emerald-600'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 via-purple-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Weather Animation */}
        <div className="relative h-24 mb-8">
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute inset-0 flex justify-center"
          >
            {weather === 'sunny' && (
              <div className="text-yellow-300 text-6xl animate-pulse">
                <FaCloudSun />
              </div>
            )}
            {/* Add other weather animations */}
          </motion.div>
        </div>

        {/* Garden Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(gardenElements).map(([key, element]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className={`relative p-6 rounded-xl backdrop-blur-lg 
                bg-gradient-to-r ${element.color} bg-opacity-20
                cursor-pointer overflow-hidden group`}
              onClick={() => setSelectedElement(key)}
            >
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <element.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{element.title}</h3>
              </div>

              <p className="text-white/80 mb-4">{element.description}</p>

              {/* Interactive Elements */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: i < (gardenData?.[key] || 0) / 2 ? 1 : 0.5 }}
                      className={`w-3 h-3 rounded-full 
                        ${i < (gardenData?.[key] || 0) / 2 ? 'bg-white' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
                <button className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                  Nurture
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 p-6 rounded-xl bg-white/10 backdrop-blur-lg"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Garden Activity</h3>
          <div className="space-y-4">
            {gardenData?.activities?.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 text-white/80"
              >
                <FaSeedling className="w-5 h-5" />
                <span>{activity.description}</span>
                <span className="text-sm opacity-50">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WellnessGarden; 