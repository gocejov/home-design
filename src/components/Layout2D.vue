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
        <v-rect @dragstart="handleDragStart" @dragend="handleDragEnd" v-for="item in inventory" :key="item.id"
          :config="item" @transformend="handleTransformEnd" />
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
    };
  },
  computed: {
    inventory() {
      return Object.values(this.objects).map((obj) => {
        return {
          id: obj.id,
          rotation: 0,
          x: obj.position[0],
          y: obj.position[1],
          width: 50,
          height: 50,
          scaleX: 1,
          scaleY: 1,
          fill: obj.fill,
          name: `rect-${obj.id}`,
          draggable: true,
        };
      });
    },
  },
  methods: {
    updateData(object) {
      this.$emit("updateData", object);
    },
    handleDragEnd(e) {
      this.updateData(e.target);
    },
    handleTransformEnd(e) {
      const rect = this.inventory.find((r) => r.name === this.selectedShapeName);
      rect.x = e.target.x();
      rect.y = e.target.y();
      rect.rotation = e.target.rotation();
      rect.scaleX = e.target.scaleX();
      rect.scaleY = e.target.scaleY();
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
