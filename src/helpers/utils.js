function generateUUID() { 
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

console.log(generateUUID());


// Simple square room
const squareRoom=     [0, 0, 40, 0, 40, 40, 0, 40];
const squareRoom1=     [0, 0, 40, 0, 40, 40, 0, 40];
const squareRoomLeft = [0, 40, 0, 40, 0, 0, 40, 0];

const squareRoom2 = [0, 0, 40, 0, 40, 0,40,40,0,40]
const squareRoom3 = [
    15,21,
    15,56,
    36,45,
    78,55,49,12

    
]

// Rectangular room
const rectangularRoom = [0, 0, 600, 0, 600, 300, 0, 300];

// L-shaped room
const lShapedRoom = [0, 0, 400, 0, 400, 200, 200, 200, 200, 400, 0, 400];

// T-shaped room
const tShapedRoom = [0, 0, 600, 0, 600, 200, 400, 200, 400, 400, 200, 400, 200, 200, 0, 200];

// Irregular pentagon room
const pentagonRoom = [0, 0, 400, 0, 500, 200, 250, 400, 0, 300];

// Room with a small alcove
const alcoveRoom = [0, 0, 400, 0, 400, 300, 450, 300, 450, 400, 300, 400, 300, 300, 0, 300];

// Room with columns (represented by inner squares)
const roomWithColumns = [
  0, 0, 600, 0, 600, 400, 0, 400,  // Outer walls
  100, 100, 150, 100, 150, 150, 100, 150,  // Column 1
  450, 100, 500, 100, 500, 150, 450, 150,  // Column 2
  100, 250, 150, 250, 150, 300, 100, 300,  // Column 3
  450, 250, 500, 250, 500, 300, 450, 300   // Column 4
];

const splitArrayIntoChunks = (array, chunkSize = 4)=> {
    const chunks = [];
    let index = 0;

    while (index < array?.length) {
        chunks.push(array?.slice(index, index += chunkSize));
    }

    return chunks;
}




const SampleRooms = {
    squareRoom,
    squareRoom1,
    rectangularRoom,
    lShapedRoom,
    tShapedRoom,
    pentagonRoom,
    alcoveRoom,
    roomWithColumns,
    squareRoomLeft,
  }

export {splitArrayIntoChunks, SampleRooms}

