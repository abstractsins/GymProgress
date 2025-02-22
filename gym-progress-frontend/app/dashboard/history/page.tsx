"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loading from "./loading";
import normalizeDate from "@/app/components/normalizeDate";

interface Workout {
  id: number;
  workout_date: string;
}

export default function History() {
  const { data: session, status } = useSession();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeframe, setTimeframe] = useState("2w");
  const [HRTimeframe, setHRTimeframe] = useState<string>();
  const [showPagination, setShowPagination] = useState(false);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = session?.user?.id || localStorage.getItem("userId");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.authToken) {
      fetchWorkouts(page, timeframe);
    }
  }, [session, status, page, timeframe]);


  const fetchWorkouts = async (page: number, timeframe: string) => {
    if (status === "loading") return;

    setLoading(true);
    setWorkouts([]);

    const token = session?.user?.authToken || localStorage.getItem("token");

    if (!token) {
      setError("No authentication session found. Please log in.");
      return;
    }

    try {
      const url = timeframe === "all"
        ? `http://localhost:5000/api/user/${userId}/history?page=${page}&timeframe=all`
        : `http://localhost:5000/api/user/${userId}/history?page=${page}&timeframe=${timeframe}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("🔍 API Request URL:", response.url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Failed to fetch exercises", errorData.message);
      }

      const data: Workout[] = await response.json();

      if (!data.workouts) {
        return;
      }

      setTotalWorkouts(data.totalWorkouts);
      setWorkouts(data.workouts);
      setTotalPages(data.totalPages);
      setShowPagination(timeframe === "all");
    } catch (error: any) {
      console.error("Error fetching exercises:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toTitleCase = (text: string) => text.replace(/\b\w/g, (char) => char.toUpperCase());

  const HRTime = (value: string) => {
    switch (value) {
      case "1w": return "1 week";
      case "2w": return "2 weeks";
      case "3w": return "3 weeks";
      case "4w": return "4 weeks";
      case "5w": return "5 weeks";
      case "6w": return "6 weeks";
    }
  }

  return (
    <div>
      <h1 className="page-header">Workout History</h1>
      {/* Timeframe Selector */}
      <div className="timeframe-filter">
        <label className="timeframe">Timeframe:</label>
        <select
          value={timeframe}
          onChange={(e) => {
            setTimeframe(e.target.value);
            setHRTimeframe(HRTime(e.target.value));
            setPage(1);
          }}
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="all">All</option>
          <option value="1w">1 Week</option>
          <option value="2w">2 Weeks</option>
          <option value="3w">3 Weeks</option>
          <option value="4w">4 Weeks</option>
          <option value="5w">5 Weeks</option>
          <option value="6w">6 Weeks</option>
        </select>
        {timeframe !== "all"
          ? <span className="timeframe">You logged {workouts.length || 0} workouts in the last {HRTimeframe || "2 weeks"}!</span>
          : <span className="timeframe">Total workouts logged: {totalWorkouts}</span>
        }
      </div>

      {loading ? (
        <Loading />
      ) : (
        <ul className="history">
          {workouts.length ? workouts.map((workout, i) =>
            <li
              className="workout"
              key={`${workout['workout_date']}-${i}`}
            >
              {normalizeDate(workout['workout_date'], false)}
            </li>
          ) : (
            <h2>No workouts found!</h2>
          )}
        </ul>
      )
      }

      {/* Pagination Controls */}
      {totalPages !== 1 && <div className="flex gap-2 mt-4 justify-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="pagination bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="nav-readout text-white">Page {page} of {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="pagination bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>}
    </div>
  )
}