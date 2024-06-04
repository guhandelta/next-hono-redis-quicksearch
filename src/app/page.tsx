"use client";
import Image from "next/image";
import { use, useEffect, useState } from "react";

export default function Home() {

  const [ input, setInput ] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{
    results: string[], // Country matches
    duration: number // Time taken to get data from DB
  }>();

  useEffect(() => {
    const fetchData = async () => {
      if(!input) return setSearchResults(undefined);
      const res = await fetch(`/api/search?input=${input}`);
    };

    fetchData();
  },[input]);

  return (
    <div className="">
      <input 
        type="text" 
        className="w-1/2 h-10 px-3 py-2 text-base text-zinc-700 placeholder-gray-600 border rounded-lg focus:shadow-outline"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
}
