// This is a seeding script to get all the data into the database
import { Redis } from '@upstash/redis'

const redis = new Redis({
    url: process.env.DB_URL,
    token: process.env.DB_TOKEN,
})

const DistrictList =[
    "Ariyalur",
    "Chengalpattu",
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Kallakurichi",
    "Kancheepuram",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Mayiladuthurai",
    "Nagapattinam",
    "Namakkal",
    "Nilgiris",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Ranipet",
    "Salem",
    "Sivagangai",
    "Tenkasi",
    "Thanjavur",
    "Theni",
    "Thoothukudi",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tirupattur",
    "Tiruppur",
    "Tiruvallur",
    "Tiruvannamalai",
    "Tiruvarur",
    "Vellore",
    "Viluppuram",
    "Virudhunagar"
];

/* ≈Redis≈ breaks down each word in the list, and make a composed instance of it, that leads up all of the way to that word like 

eg: ARIYALUR => A => AR => ARI => ARIY => ARIYA => ARIYAL => ARIYALU => ARIYALUR* 

the finished word has a * at the end of it, to indicate that it is the complete word. No matter which combination of the word is typed, it will always lead to the complete word, and thw search bar will always suggest the complete word with the *, and not any of these combinations, as they just exist to make that word searchable.*/
DistrictList.forEach((districtName) => {
    // All the words are stored in the DB in uppercase, so that the search is case insensitive.
    const term = districtName.toUpperCase();
    const districts: { score: 0, member: string }[] = [];

    // Collecting all the possible combinations of the district names into an array
    let i;
    // Iterate through each of the district names and store each combination in the districts array
    for(i = 1; i <= term.length; i++) {
        districts.push({ 
            /* The primary role of the score in the Redis DB is to determine the position of each element (member) within the sorted set. Members are sorted in ascending order based on their scores. Lower scores come first, higher scores later.
            If multiple members have the same score, they are further ordered lexicographically (based on their string values).

                    - Ranking and Retrieval
                    - Range Queries
                    - Custom Ordering
                    -  Updating Scores: */
            score: 0, 
            // Generate the substring combination of the district name, with every index as the length, starting from the 0th index and ending at the ith index. A - AR - ARI - ARIY - ARIYA - ARIYAL - ARIYALU - ARIYALUR
            member: term.substring(0, i) 
        });
    }
    // Store the complete district name,(i.e.) final name, with a * appended to the end of the name, which would be the actual name that will be suggested to the userm in the search bar
    districts.push({ score: 0, member: term + "*" });

    const populateDB = async () => {
        // Adding the district names to a soreted set, which is actually a redis data structure, which is nothing but a set of key:value pairs, where every entry has it's own score, which is 0 in this case.

        // districts => single namespace for all the districts in the Redis DB,
        // This error can be ignored, as this error might be due to some TypeScript incompatibility with the Redis DB or SDK
        // @ts-expect-error 
        await redis.zadd("districts2", ...districts);
    }

    // Populate the DB with all combinations of all the district names in the Redis DB, and build the foundation for the fast performance of the search
    populateDB(); 
});