"use client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {

  const [ input, setInput ] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{
    results: string[], // Country matches
    duration: number // Time taken to get data from DB
  }>();

  useEffect(() => {
    
    const fetchData = async () => {
      
      if(!input) return setSearchResults(undefined);
      const res = await fetch(`/api/search?q=${input}`);
      const data = (await res.json()) as { results: string[], duration: number }; 

      console.log("Results:\t",data.results);
      console.log("Duration:\t",data.duration);
      
      setSearchResults(data);
    };

    fetchData();
  },[input]);

  return (
    <div className="h-screen w-screen grainy">
      <div className="flex flex-col gap-6 items-center pt-32 duration-500 animate animate-in fade-in-5 slide-in-from-bottom-2.5">
        <h1 className="text-5xl tracking-light font-bold">Quick Search</h1>
        <p className="text-zinc-600 max-w-prose text-center text-lg">
          A High perfromance API build with Hono, NextJS, and Cloudflare <br />
        </p>
        <div className="max-w-md w-full">
          <Command>
            <CommandInput 
              className="placeholder:text-gray-500w-1/2 h-10 px-3 py-2 text-base text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline"
              placeholder="Search for a district"
              value={input}
              onValueChange={setInput}
            />
            <CommandList>
              {searchResults && searchResults?.results.length ? (
                <CommandEmpty>No Results Found</CommandEmpty>
              ) : null}

              {searchResults?.results ? (
                <CommandGroup heading="Results">
                  {searchResults.results.map((result) => (
                    <CommandItem 
                      key={result} 
                      value={result}
                      onSelect={setInput}
                    >
                      {result}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ): null}
            </CommandList>
          </Command>
        </div>
        {/* <input 
          type="text" 
          className="w-1/3 h-10 px-3 py-2 text-base text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          title="District Search"
          placeholder="Enter your input"
        /> */}
      </div>
    </div>
  );
}
