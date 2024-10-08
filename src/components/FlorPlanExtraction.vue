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
    </div>
</template>

<script>
// import { Stage, Layer, Line, Image } from 'vue-konva';
// import Konva from "konva";

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

        // Edge detection and line extraction
        extractLines() {
            const src = cv.imread(this.$refs.imageCanvas); // Read from canvas
            const gray = new cv.Mat();
            const edges = new cv.Mat();
            const contours = new cv.MatVector();

            // Convert to grayscale
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            // Apply Canny Edge Detection
            cv.Canny(gray, edges, 50, 150);

            // Find contours
            cv.findContours(edges, contours, new cv.Mat(), cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

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
                        strokeWidth: 1, // Thinner lines
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
