import simplify from 'simplify-js';

// Original data
const data = [
    {
        points: [
            906, 675, 906, 726, 914, 726, 914, 725, 915, 724,
            919, 724, 920, 725, 919, 726, 916, 726, 919, 726,
            920, 725, 923, 725, 924, 724, 927, 724, 928, 723,
            // ... more points
            907, 675
        ],
        stroke: "#000000",
        strokeWidth: 2,
        lineCap: "round",
        lineJoin: "round"
    }
    // You can add more sets of data here if needed
];

// Convert the flat array of points into an array of point objects
function convertToPointObjects(points) {
    const result = [];
    for (let i = 0; i < points.length; i += 2) {
        result.push({ x: points[i], y: points[i + 1] });
    }
    return result;
}

// Convert back from array of point objects to flat array
function convertToFlatArray(points) {
    const result = [];
    for (const point of points) {
        result.push(point.x, point.y);
    }
    return result;
}

const simplifyData = (data) => {
    // Tolerance level for simplification (set to a low value for minimal interpolation)
    const tolerance = 0.5; // Adjust this for more or fewer points (lower values keep more detail)
    
    // Process each dataset
    return data.map(item => {
        // Convert to point objects
        const points = convertToPointObjects(item.points);
    
        // Simplify the points
        const simplifiedPoints = simplify(points, tolerance, true);
    
        // Convert back to flat array
        const simplifiedFlatPoints = convertToFlatArray(simplifiedPoints);
    
        return {
            ...item,
            points: simplifiedFlatPoints // Replace with simplified points
        };
    });
}


export { simplifyData};


