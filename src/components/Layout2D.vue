<template>
  <div>
    <div id="drag-items">
      <img class="images" src="@/assets/bunny.jpeg" draggable="true" type="bunny" id="bunny" />
      <img class="images" src="@/assets/rubiks-cube.jpg" draggable="true" type="block" id="block" />
      <img class="images" src="@/assets/table.jpg" draggable="true" type="asset" id="asset" />
    </div>
    <v-stage class="stage" ref="stage" :config="stageSize" @mousedown="handleStageMouseDown"
      @touchstart="handleStageMouseDown">
      <v-layer ref="layer">
        <v-group :config="`group-${item.name}`"  v-for="item in inventory" :key="item.id" @dragstart="handleDragStart" @dragend="handleDragEnd">
          <v-rect :config="item" @transformend="handleTransformEnd" />
          <v-text :config="{text: 'Some text on canvas', fontSize: 15,x:item.x,y:item.y}"/>
        </v-group>
        <v-group>
          <v-line
            v-if="currentPolygon"
            :config="{
              points: currentPolygon.points,
              stroke: 'black',
              strokeWidth: 2,
              closed: true,  // Makes it a polygon by closing the shape
             
              lineCap: 'round',
              lineJoin: 'round',
            }"
          />
        </v-group>
          <v-group>
            <v-line
              v-for="(polygon, index) in polygons"
              :key="index"
              :config="{
                points: polygon.points,
                stroke: 'black',
                strokeWidth: 2,
                closed: true,  // Close the polygon
              
                lineCap: 'round',
                lineJoin: 'round',
              }"
            />
          </v-group>
        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import Konva from "konva";
const width = window.innerWidth;
const height = window.innerHeight;

export default {
  props: ["objects", "updatedRotation"],
  data() {
    return {
      stageSize: {
        width: width,
        height: height,
      },
      selectedShapeName: "",
      isDragging:false,
      polygons: [], // All completed polygons
      currentPolygon: null, // The polygon being drawn
    };
  },
  computed: {
    inventory() {
      console.log("this.objects inventory",this.objects)
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
          id:obj.id,
          draggable: true,
        };
      });
    },
  },
  watch:{
    polygons:{
      handler(newValue, oldValue) {
        console.log("this.polygons.update L2")
       this.$emit("updatePolygons",this.polygons)
      },
      deep: true
    }
  },
  methods: {

    startDrawing(event) {
      if(this.isDragging) return
      const pos = this.getRelativePointerPosition(event.target.getStage());

      // If a polygon is already being drawn, add a new point
      if (this.currentPolygon) {
        this.currentPolygon.points.push(pos.x, pos.y);
      } else {
        // Start a new polygon
        this.currentPolygon = {
          points: [pos.x, pos.y],
        };
      }
    },

    // Update the last point of the polygon as the user moves the mouse
    updatePolygon(event) {
      if (!this.currentPolygon) return;

      const pos = this.getRelativePointerPosition(event.target.getStage());
      const points = [...this.currentPolygon.points];
      
      // Update the last point to follow the cursor
      points[points.length - 2] = pos.x;
      points[points.length - 1] = pos.y;

      this.currentPolygon.points = points;
    },

    // End the drawing and close the polygon
    endDrawing() {
      if (this.currentPolygon) {
        this.polygons.push({ points: [...this.currentPolygon.points] });
      }
      this.currentPolygon = null;
      console.log(this.polygons)
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

      console.log("inventory",this.inventory)

      const rect = this.inventory.find((r) => r.name === this.selectedShapeName);
      rect.x = e.target.x();
      rect.y = e.target.y();
      rect.rotation = e.target.rotation();
      rect.scaleX = e.target.scaleX();
      rect.scaleY = e.target.scaleY();
      console.log("rect.rotation",rect.rotation)
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

    const stage = this.$refs.stage.getStage();
    const that = this
    const container = stage.attrs.container

    stage.on("mousedown", this.startDrawing);
    stage.on("mousemove", this.updatePolygon);
    stage.on("dblclick", this.closePolygon);  // Double-click to close the polygon
    
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
      that.$emit("oNAddToStage", stage.getPointerPosition(), type,src);
    });

    container.addEventListener('keydown', function (e) {
      if (e.code === "Backspace") {
        const node = transformerNode.node()
        console.log("node",node)
        if (!node) return
        that.$emit("onRemove", node);
        transformerNode.nodes([]);
      }
      e.preventDefault();
    });

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
