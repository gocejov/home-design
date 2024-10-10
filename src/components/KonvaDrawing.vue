<!-- KonvaDrawing.vue -->
<template>
    <div>
        <h3>Draw Lines</h3>
        <v-stage @mousedown="startDrawing" @mouseup="endDrawing" @mousemove="draw">
            <v-layer>
                <v-line
                    v-for="(line, index) in lines"
                    :key="index"
                    :points="line.points"
                    :stroke="'black'"
                    :strokeWidth="2"
                    :lineCap="'round'"
                    :lineJoin="'round'"
                />
            </v-layer>
        </v-stage>
    </div>
</template>

<script>

export default {
    data() {
        return {
            isDrawing: false,
            lines: [],
            currentLine: [],
        };
    },
    methods: {
        startDrawing(event) {
            this.isDrawing = true;
            const pos = this.$refs['v-stage'].getPointerPosition();
            this.currentLine = [pos.x, pos.y];
            this.lines.push({ points: this.currentLine });
        },
        endDrawing() {
            this.isDrawing = false;
            this.$emit('lines-drawn', this.lines);
        },
        draw(event) {
            if (!this.isDrawing) return;
            const pos = this.$refs['v-stage'].getPointerPosition();
            this.currentLine[2] = pos.x;
            this.currentLine[3] = pos.y;
            this.$set(this.lines, this.lines.length - 1, { points: this.currentLine });
        },
    },
};
</script>

<style scoped>
.v-stage {
    border: 1px solid #ccc;
}
</style>
