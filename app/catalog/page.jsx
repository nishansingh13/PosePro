'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

function Catalog() {
  const exercises = [
    {
      id: 1,
      name: "Jumping Jacks",
      image: "/images/jumping-jacks.png",
      description: "Full body exercise that increases heart rate and improves coordination."
    },
    {
      id: 2,
      name: "Bicep Curls",
      image: "/images/bicep-curls.png",
      description: "Strength exercise that targets the biceps and forearms."
    },
    {
      id: 3,
      name: "Squats",
      image: "/images/squats.png",
      description: "Lower body exercise that strengthens quadriceps, hamstrings, and glutes."
    },
    {
      id: 4,
      name: "Push Ups",
      image: "/images/push-ups.png",
      description: "Upper body exercise that works the chest, shoulders, and triceps."
    },
    {
      id: 5,
      name: "Lunges",
      image: "/images/jumping-jacks.png", // Replace with proper image
      description: "Lower body exercise that improves balance and strengthens legs."
    },
    {
      id: 6,
      name: "Planks",
      image: "/images/bicep-curls.png", // Replace with proper image
      description: "Core exercise that improves stability and posture."
    },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Exercise Catalog</h1>
      <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
        Browse our collection of exercises with AI pose detection support. 
        Click on any exercise to learn more or start practicing with real-time feedback.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {exercises.map((exercise) => (
          <div 
            key={exercise.id} 
            className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 transition hover:shadow-xl"
          >
            <div className="relative h-48 w-full">
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                {/* Fallback if image doesn't load */}
                <div className="text-xl font-bold">{exercise.name}</div>
              </div>
              <img
                src={exercise.image}
                alt={exercise.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder.png";
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{exercise.name}</h3>
              <p className="text-gray-400 mb-4">{exercise.description}</p>
              <div className="flex space-x-2">
                <Link 
                  href={`/detect?exercise=${exercise.id}`} 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex-1 text-center"
                >
                  Practice
                </Link>
                <Link 
                  href={`/catalog/${exercise.id}`}
                  className="border border-gray-700 hover:bg-gray-700 text-white px-4 py-2 rounded flex-none text-center"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;
