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
                <v-line
                    v-for="(line, index) in lines"
                    :key="index"
                    :config="line"
                />
            </v-layer>
        </v-stage>

        <!-- Controls for Canny Edge Detection -->
        <div>
            <label for="cannyThreshold1">Canny Threshold 1:</label>
            <input
                id="cannyThreshold1"
                type="range"
                v-model="cannyThreshold"
                min="0"
                max="255"
                @input="updateLines"
            />
            <span>{{ cannyThreshold }}</span>

            <label for="cannyThreshold2">Canny Threshold 2:</label>
            <input
                id="cannyThreshold2"
                type="range"
                v-model="cannyThreshold2"
                min="0"
                max="255"
                @input="updateLines"
            />
            <span>{{ cannyThreshold2 }}</span>

            <label for="gaussianKernel">Gaussian Blur Kernel Size:</label>
            <input
                id="gaussianKernel"
                type="number"
                v-model="gaussianKernel"
                min="1"
                max="31"
                @input="updateLines"
            />
            <span>{{ gaussianKernel }}</span>

            <label for="minLineLength">Minimum Line Length:</label>
            <input
                id="minLineLength"
                type="number"
                v-model="minLineLength"
                min="1"
                @input="updateLines"
            />
            <span>{{ minLineLength }}</span>

            <label for="maxLineGap">Maximum Line Gap:</label>
            <input
                id="maxLineGap"
                type="number"
                v-model="maxLineGap"
                min="0"
                @input="updateLines"
            />
            <span>{{ maxLineGap }}</span>

            <label for="lineColor">Line Color:</label>
            <input
                id="lineColor"
                type="color"
                v-model="lineColor"
                @input="updateLines"
            />
            <span>{{ lineColor }}</span>

            <label>
                <input type="checkbox" v-model="displayImage" @change="updateLines" />
                Show Original Image
            </label>

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
            cannyThreshold: 50,
            cannyThreshold2: 150,
            gaussianKernel: 1, // Kernel size for Gaussian blur
            minLineLength: 10, // Minimum line length
            maxLineGap: 5, // Maximum gap between points on the line
            lineStrokeWidth: 2,
            lineColor: '#000000', // Default line color
        };
    },
    methods: {
        showHideImage() {
            this.displayImage = !this.displayImage;
        },
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
                    this.imageConfig.image = img;
                    this.imageConfig.width = img.width;
                    this.imageConfig.height = img.height;

                    this.stageConfig.width = img.width;
                    this.stageConfig.height = img.height;

                    this.extractLines();
                };
            };
            reader.readAsDataURL(file);
        },

        updateLines() {
            this.extractLines();
        },

        extractLines() {
            const src = cv.imread(this.$refs.imageCanvas);
            const gray = new cv.Mat();
            const edges = new cv.Mat();
            const contours = new cv.MatVector();

            // Convert to grayscale
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

            // Apply Gaussian Blur if kernel size > 1
            if (this.gaussianKernel > 1) {
                const blurred = new cv.Mat();
                cv.GaussianBlur(gray, blurred, new cv.Size(this.gaussianKernel, this.gaussianKernel), 0);
                cv.cvtColor(blurred, gray, cv.COLOR_RGBA2GRAY);
                blurred.delete(); // Clean up
            }

            // Apply Canny Edge Detection with current thresholds
            cv.Canny(gray, edges, parseFloat(this.cannyThreshold), parseFloat(this.cannyThreshold2));

            // Find contours
            cv.findContours(edges, contours, new cv.Mat(), cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

            // Clear previous lines
            this.lines = [];
            const extractedLines = [];

          for (let i = 0; i < contours.size(); i++) {
                const contour = contours.get(i);
                const points = [];
                for (let j = 0; j < contour.rows; j++) {
                    points.push(contour.data32S[j * 2], contour.data32S[j * 2 + 1]);
                }
                if (points.length > 0) {
                  // console.log("points : ", points)
                    // Filter by min line length (simple approach, adjust as needed)
                    if (points.length / 2 >= this.minLineLength) {
                        this.lines.push({
                            points: points,
                            stroke: this.lineColor,
                            strokeWidth: this.lineStrokeWidth,
                            lineCap: "round",
                            lineJoin: "round",
                        });
                      // is this even good way to extract the lines ?
                      // increment by 2 cause each point consists of two x and y
                      for (let j = 0; j < points.length - 2; j += 2) {
                        extractedLines.push({
                          start: { x: points[j], y: points[j + 1] },
                          end: { x: points[j + 2], y: points[j + 3] }
                        });
                      }
                    }
                }
            }
          this.$emit('linesExtracted', extractedLines)
          console.log("emiting extracted lines :", extractedLines) // here we good

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
