"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Import NextAuth session

interface ExercisesListProps {
    value: string;
    name: string;
    onChange: (value: string) => void;
  }

export default function ExercisesList({ value, onChange }: ExercisesListProps) {
    const { data: session, status } = useSession(); // Get authentication session
    const [exercises, setExercises] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const userId = session?.user.id || localStorage.getItem("userId");
    
    useEffect(() => {
        if (status === "authenticated" && session?.user.authToken) {
            fetchExercises();
        }
    }, [session, status]);

    const fetchExercises = async () => {
        if (status === "loading") return; // Wait for session to load

        const token = session?.user?.authToken || localStorage.getItem("token");
    
        if (!token) {
            setError("No authentication session found. Please log in.");
            return;
        }


        try {
            const response = await fetch(`http://localhost:5000/api/user/${userId}/exercises`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Ensure token is attached if needed
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch exercises");
            }

            const data = await response.json();
            console.log("Fetched Exercises:", data);
            if (!Array.isArray(data)) {
                console.warn("API did not return an array");
                return;
            }

            setExercises(data);
        } catch (error: any) {
            console.error("Error fetching exercises:", error.message);
            setError(error.message);
        }
    };

    const toTitleCase = (text: string) => text.replace(/\b\w/g, (char) => char.toUpperCase());

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // if (exercises.some(ex => toTitleCase(ex) === e.target.value)) {
          onChange(e.target.value); // Send selected value to parent
        // }
    };

    return (
        <select
            className="new-workout-field"
            // list="exercises-list"
            name="exercise"
            // placeholder="Choose an exercise"
            value={value}
            onChange={handleSelect}
            required
            id="exercises-list"
        >
            <option value="" disabled hidden>Select an exercise</option>    
            {exercises.map((exercise, index) => (
                <option className="" key={index} value={toTitleCase(exercise.name)}>{toTitleCase(exercise.name)}</option>
            ))}
        </select>
    );
}
