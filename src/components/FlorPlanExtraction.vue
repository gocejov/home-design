<template>
    <div>
        <h2>Floor Plan Line Extraction</h2>
        <!-- Image Input -->
        <input type="file" @change="onImageUpload" />
        <input type="button" value="Hide image" @click="showHideImage" />

        <!-- Canvas to display original image -->
        <canvas ref="imageCanvas"></canvas>
        <canvas ref="canvasOutput" width="508" height="472"></canvas>

        <!-- Konva Stage to display extracted lines -->
        <v-stage :config="stageConfig">
            <v-layer>
                <v-image v-if="displayImage" :config="imageConfig" />
                <v-line v-for="(line, index) in lines" :key="index" :config="line" />
            </v-layer>
        </v-stage>

        <!-- Controls for Canny Edge Detection -->
        <div>
            <label for="threshold1">Canny Threshold 1:</label>
            <input
                id="threshold1"
                type="range"
                v-model="cannyThreshold"
                min="0"
                max="255"
                @input="updateLines"
            />
            <span>{{ cannyThreshold }}</span>

            <label for="threshold2">Canny Threshold 2:</label>
            <input
                id="threshold2"
                type="range"
                v-model="cannyThreshold2"
                min="0"
                max="255"
                @input="updateLines"
            />
            <span>{{ cannyThreshold2 }}</span>

            <label for="lineWidth">Line Stroke Width:</label>
            <input
                id="lineWidth"
                type="range"
                v-model="lineStrokeWidth"
                min="1"
                max="10"
                @input="updateLines"
            />
            <span>{{ lineStrokeWidth }}</span>
        </div>
    </div>
</template>

<script>
import Konva from 'konva';

export default {

    data() {
        return {
            displayImage: true,
            stageConfig: {
                width: 800,
                height: 600,
            },
            imageConfig: {
                image: null,
                width: 800,
                height: 600,
            },
            lines: [],
            cannyThreshold: 50, // Initial value for Canny Threshold 1
            cannyThreshold2: 150, // Initial value for Canny Threshold 2
            lineStrokeWidth: 2, // Initial stroke width
        };
    },
    methods: {
        showHideImage() {
            this.displayImage = !this.displayImage;
        },
        // Handle image upload
        onImageUpload(event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    this.$refs.imageCanvas.width = img.width;
                    this.$refs.imageCanvas.height = img.height;
                    const ctx = this.$refs.imageCanvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    this.imageConfig.image = img; // Set image in Konva
                    this.imageConfig.width = img.width; // Set image in Konva
                    this.imageConfig.height = img.height; // Set image in Konva

                    // Ensure Konva stage size matches image
                    this.stageConfig.width = img.width;
                    this.stageConfig.height = img.height;

                    this.extractLines(); // Extract lines
                };
            };
            reader.readAsDataURL(file);
        },

        // Update lines based on input from controls
        updateLines() {
            this.extractLines(); // Re-extract lines based on updated parameters
        },

        // Edge detection and line extraction
        extractLines() {
            const src = cv.imread(this.$refs.imageCanvas); // Read from canvas
            const gray = new cv.Mat();
            const edges = new cv.Mat();
            const contours = new cv.MatVector();

            // Convert to grayscale
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            // Apply Canny Edge Detection with current thresholds
            cv.Canny(gray, edges, parseFloat(this.cannyThreshold), parseFloat(this.cannyThreshold2)); // Ensure proper type

            // Find contours
            cv.findContours(edges, contours, new cv.Mat(), cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

            // Clear previous lines
            this.lines = []; 
            for (let i = 0; i < contours.size(); i++) {
                const contour = contours.get(i);
                const points = [];
                for (let j = 0; j < contour.rows; j++) {
                    points.push(contour.data32S[j * 2], contour.data32S[j * 2 + 1]);
                }
                if (points.length > 0) {
                    this.lines.push({
                        points: points,
                        stroke: "black",
                        strokeWidth: this.lineStrokeWidth, // Use dynamic stroke width
                        lineCap: "round",
                        lineJoin: "round",
                    });
                }
            }

            // Clean up
            src.delete();
            gray.delete();
            edges.delete();
            contours.delete();
        },
    },
};
</script>

<style scoped>
canvas {
    /* display: none; */
}
</style>
