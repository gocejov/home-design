<template>
  <div>
    <div id="drag-items">
      <img class="images" src="@/assets/bunny.jpeg" draggable="true" type="bunny" id="bunny" />
      <img class="images" src="@/assets/rubiks-cube.jpg" draggable="true" type="block" id="block" />
      <img class="images" src="@/assets/table.jpg" draggable="true" type="asset" id="asset" />
    </div>
    <input type="file" @change="onImageUpload" />
    <v-stage class="stage" ref="stage" :config="stageSize" @mousedown="handleStageMouseDown"
      @touchstart="handleStageMouseDown">
      <v-layer ref="layer">

        <v-image v-if="displayImage" :config="imageConfig" />

        <v-group :config="`group-${item.name}`" v-for="item in inventory" :key="item.id" @dragstart="handleDragStart"
          @dragend="handleDragEnd">
          <v-rect :config="item" @transformend="handleTransformEnd" />
          <v-text :config="{ text: 'Some text on canvas', fontSize: 15, x: item.x, y: item.y }" />
        </v-group>


        <v-line v-if="currentLine" :config="{
          points: currentLine.points,
          stroke: '#2196f3',
          strokeWidth: 5,
          lineCap: 'round',
          lineJoin: 'round',
        }" />

        <v-group v-for="(wall, index) in walls" :key="index">
          <!-- Render all existing lines -->
          <v-line v-for="(line, index) in wall" :key="index" :config="{
            points: line.points,
            stroke: '#2196f3',
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round',
            listening: false,
          }" />

          <v-circle v-if="false" v-for="(line, index) in wall" :key="index" :config="{
            x: line.points[line.points.length - 2],
            y: line.points[line.points.length - 1],
            stroke: 'black',
            fill: 'red',
            radius: 10,
            listening: false,
          }" @dblclick="handleCircleDblClick" />
        </v-group>

        <v-line v-for="(line, index) in lines" :key="index" :config="{
          points: line.points,
          stroke: '#2196f3',
          strokeWidth: 5,
          lineCap: 'round',
          lineJoin: 'round',
          listening: false,
        }" />

        <v-circle v-if="false" v-for="(line, index) in lines" :key="index" :config="{
          x: line.points[line.points.length - 2],
          y: line.points[line.points.length - 1],
          stroke: 'black',
          fill: 'red',
          radius: 10,
          name:`snap-point-${index}`,
          listening: false,
        }" @dblclick="handleCircleDblClick" />


        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import Konva from "konva";
import { ref } from "vue";
const width = window.innerWidth;
const height = window.innerHeight;

export default {
  props: ["objects", "updatedRotation"],
  data() {
    return {
      stageSize: {
        width: 700,
        height: 500,
      },
      selectedShapeName: "",
      isDragging: false,
      polygons: [], // All completed polygons
      currentPolygon: null, // The polygon being drawn
      lines: [],
      currentLine: null,
      isDrawing: false,
      snapTolerance: 10,
      walls: [],
      imageConfig: {
        image: null,
        width: 800,
        height: 600,
      },
      displayImage:true
    };
  },
  computed: {
    snapPoints() {
      let points = this.walls ? this.walls.flatMap(w => w.flatMap(l => l.points)) : this.lines.flatMap(l => l.points)
      console.log("Snap points", points)
      return points
    },

    inventory() {
      console.log("this.objects inventory", this.objects)
      return Object.values(this.objects).map((obj) => {
        return {
          rotation: 0,
          x: obj.position[0],
          y: obj.position[1],
          width: 50,
          height: 50,
          scaleX: 1,
          scaleY: 1,
          fill: obj.fill,
          name: `rect-${obj.id}`,
          id: obj.id,
          draggable: true,
        };
      });
    },
  },
  watch: {
    walls: {
      handler(newValue, oldValue) {
        console.log("this.polygons.update L2")
        this.$emit("updatePolygons", this.walls)
      },
      deep: true
    }
  },
  methods: {
    onImageUpload(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          this.imageConfig.image = img;
          this.imageConfig.width = this.stageSize.width;
          this.imageConfig.height = this.stageSize.height;
        };
      };
      reader.readAsDataURL(file);
    },
    handleCircleDblClick(event) {
      // Perform the desired action for the circle
      console.log("Circle double-clicked!");

      // Stop the event from propagating to the stage
      event.cancelBubble = true;
    },
    startDrawing(event) {
      this.isDrawing = true
      const pos = this.getRelativePointerPosition(event.target.getStage());
      this.currentLine = {
        points: [pos.x, pos.y, pos.x, pos.y],
      };
    },

    // Update the last point of the polygon as the user moves the mouse
    updatePolygon(event) {
      if (!this.isDrawing) return


      const pos = this.getRelativePointerPosition(event.target.getStage());



      // Check for snapping
      let snapX = pos.x;
      let snapY = pos.y;

      let p = this.snapPoints
      console.log("Snap P", p)

      for (const pointPos in this.snapPoints) {
        if (pointPos % 2 == 0) {
          let point = this.snapPoints[pointPos]
          let y = this.snapPoints[pointPos - 1]
          let x = this.snapPoints[pointPos]

          const distance = Math.sqrt(
            Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2)
          );
          console.log("distance", distance, pos.x, x, pointPos, distance < this.snapTolerance)

          if (distance < this.snapTolerance) {

            snapX = x;
            snapY = y;
          }
        }
      };

      const newPoints = [...this.currentLine.points];
      newPoints[2] = snapX;
      newPoints[3] = snapY;

      this.currentLine.points = newPoints;
    },

    // End the drawing and close the polygon
    endDrawing() {
      if (this.currentLine) {
        this.lines.push(this.currentLine);
        // this.polygons.push(this.lines);
        console.log("this.lines", this.lines)
        //this.currentLine = null;
      }
    },

    // End the drawing and close the polygon
    stopDrawing() {
      console.log("stopDrawing")
      //if (this.currentLine) {
      const newPoints = [...this.currentLine.points];
      // newPoints[2] = this.lines[0].points[0];
      // newPoints[3] = this.lines[0].points[1];

      this.currentLine.points = newPoints;
      this.lines.push(this.currentLine);
      this.walls.push(this.lines);
      console.log("this.lines", this.lines)
      this.lines = []
      this.isDrawing = false
      this.currentLine = null
      //}

    },



    // Get mouse position relative to the stage
    getRelativePointerPosition(stage) {
      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      return transform.point(stage.getPointerPosition());
    },

    // Close the polygon by connecting the last point to the first
    closePolygon() {
      if (this.currentPolygon) {
        const points = this.currentPolygon.points;
        // Add the first point at the end to close the polygon
        points.push(points[0], points[1]);
        this.endDrawing();
      }
    },

    handleDragStart() {
      this.isDragging = true;
    },
    updateData(object) {
      this.$emit("updateData", object);
    },
    handleDragEnd(e) {
      this.updateData(e.target);
      this.isDragging = false
    },
    degreesToRadians(degrees) {
      return degrees * (Math.PI / 180);
    },
    handleTransformEnd(e) {

      console.log("inventory", this.inventory)

      const rect = this.inventory.find((r) => r.name === this.selectedShapeName);
      rect.x = e.target.x();
      rect.y = e.target.y();
      rect.rotation = e.target.rotation();
      rect.scaleX = e.target.scaleX();
      rect.scaleY = e.target.scaleY();
      console.log("rect.rotation", rect.rotation)
      this.updateData(e.target);
    },
    handleStageMouseDown(e) {
      // clicked on stage - clear selection
      if (e.target === e.target.getStage()) {
        this.selectedShapeName = "";
        this.updateTransformer();
        return;
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer = e.target.getParent().className === "Transformer";
      if (clickedOnTransformer) {
        return;
      }

      // find clicked rect by its name
      const name = e.target.name();

      const rect = this.inventory.find((r) => r.name === name);
      if (rect) {
        this.selectedShapeName = name;
      } else {
        this.selectedShapeName = "";
      }
      this.updateTransformer();
    },
    updateTransformer() {
      // here we need to manually attach or detach Transformer node
      const transformerNode = this.$refs.transformer.getNode();
      const stage = transformerNode.getStage();
      const { selectedShapeName } = this;

      const selectedNode = stage.findOne("." + selectedShapeName);
      // do nothing if selected node is already attached
      if (selectedNode === transformerNode.node()) {
        return;
      }

      if (selectedNode) {
        // attach to another node
        transformerNode.nodes([selectedNode]);
      } else {
        // remove transformer
        transformerNode.nodes([]);
      }
    },
  },
  mounted() {

    var shadowOffset = 20;
    var tween = null;
    var blockSnapSize = 30;
    const stage = this.$refs.stage.getStage();
    const that = this
    const container = stage.attrs.container

    stage.on("mousedown", this.startDrawing);
    stage.on("mousemove", this.updatePolygon);
    stage.on("mouseup", this.endDrawing);  // Double-click to close the polygon
    stage.on("dblclick", this.stopDrawing);

    container.tabIndex = 1;
    // focus it
    // also stage will be in focus on its click
    const transformerNode = that.$refs.transformer.getNode();
    let type = null
    let src = null

    document.getElementById("drag-items").addEventListener("dragstart", function (e) {
      type = e.target.id;
      src = e.target.src;
    });

    container.addEventListener("dragover", function (e) {
      e.preventDefault(); // !important
    });

    container.addEventListener("drop", async function (e) {
      e.preventDefault();
      stage.setPointersPositions(e);
      that.$emit("oNAddToStage", stage.getPointerPosition(), type, src);
    });

    container.addEventListener('keydown', function (e) {
      if (e.code === "Backspace") {
        const node = transformerNode.node()
        console.log("node", node)
        if (!node) return
        that.$emit("onRemove", node);
        transformerNode.nodes([]);
      }
      e.preventDefault();
    });

    var gridLayer = new Konva.Layer();
    var padding = blockSnapSize;
    console.log(width, padding, width / padding);
    for (var i = 0; i < width / padding; i++) {
      gridLayer.add(new Konva.Line({
        points: [Math.round(i * padding) + 0.5, 0, Math.round(i * padding) + 0.5, height],
        stroke: '#ddd',
        strokeWidth: 1,
      }));
    }

    gridLayer.add(new Konva.Line({ points: [0, 0, 10, 10] }));
    for (var j = 0; j < height / padding; j++) {
      gridLayer.add(new Konva.Line({
        points: [0, Math.round(j * padding), width, Math.round(j * padding)],
        stroke: '#ddd',
        strokeWidth: 0.5,
      }));
    }

  },
};
</script>
<style scoped>
.images {
  width: 100px;
  height: 100px;
}

.stage {
  border: 1px solid red;
}
</style>
