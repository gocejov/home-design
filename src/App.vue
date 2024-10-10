<template>
  
  <div class="clear">
<!--    <FlorPlanExtraction  v-if="selectedTab == 3"/>-->
    <div class="tabs">
      <v-btn class="tab" @click="selectedTab = 1"> 2D View </v-btn>
      <v-btn class="tab" @click="selectedTab = 2"> 3D View</v-btn>
      <v-btn class="tab" @click="selectedTab = 3"> Flor plan</v-btn>
      <v-btn class="tab" @click="selectedTab = 4"> Walkthrough</v-btn>
      <v-btn class="tab" @click="reset"> Reset positions</v-btn>
      <v-btn class="tab" @click="reset"> +15 </v-btn>
    </div>
    <div class="tabs-content">
      <div style="width: 700px">
        <Layout2D v-if="selectedTab == 1"  :objects="data" @updateData="on2DDataUpdated" @updatePolygons="onUpdatePolygons" @oNAddToStage="addToStage" @onRemove="onRemove" />
      </div>
      <div style="width: 700px">
        <Layout3D :objects="data" :polygons="polygons" @updateData="on3DDataUpdated" :extractedLines="extractedLines" />
      </div>
      <div >
        <FlorPlanExtraction  v-if="selectedTab == 3" @linesExtracted="onLinesExtracted" />/>
      </div>
      <div style="width: 700px">
        <KonvaDrawing  v-if="selectedTab == 4" @lines-drawn="updateLines" />
      </div>
      <div style="width: 700px">
        <ThreeDWall  v-if="selectedTab == 4"  :linesin="lines"/>
      </div>
      <!-- <div style="width: 700px">
        <Layout3DTest  v-if="selectedTab == 4" :objects="data" :points="points" @updateData="on3DDataUpdated" />
      </div> -->
    </div>
  </div>
</template>

<script>
import Layout2D from '@/components/Layout2D.vue'
import Layout3D from '@/components/Layout3D.vue'
import FlorPlanExtraction from '@/components/FlorPlanExtraction.vue'
import Layout3DTest from '@/components/Layout3DTest.vue'
import {getObjects} from '@/api/objectsDataApi'
import KonvaDrawing from '@/components/KonvaDrawing.vue';
import ThreeDWall from '@/components/ThreeDWall.vue';
// import {generateUUID} from '@/helpers/utils'
const paths = ["ASSET.glb", 'https://raw.githubusercontent.com/Tresjs/assets/main/models/gltf/ugly-naked-bunny/ugly-naked-bunny-animated.gltf', 'Blocks.glb']
const getRandom = (min = 1, max = 10) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default {
  name: "2D Layout",
  components: {
    Layout2D,
    Layout3D,
    Layout3DTest,
    FlorPlanExtraction,
    KonvaDrawing,
    ThreeDWall
  },
  data() {
    return {
      selectedTab: 1,
      updateRotation: 0,
      objects:[],
      data:[],
      // Simple square room
      polygons:[],
      extractedLines: []
    }
  },
  computed:{
    data1(){
      const comp = []
      for(let o of  this.objects){
        o.id = o._id
        comp[o.id] = o
      }
      
      return comp
    }
  },
  methods: {
    updateLines(lines) {
            this.lines = lines;
        },
    reset() {
      this.data.map(o => o.position[0] = 0)
    },
    onRemove(elem){
      this.data = this.data.filter(f=> elem.id()!== f.id);
    },
    addImageProcess(src){
      return new Promise((resolve, reject) => {
        let img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    },
    async addToStage(position,type,src) {
      const image = await this.addImageProcess(src)
      const model = {
        path: 'https://raw.githubusercontent.com/Tresjs/assets/main/models/gltf/ugly-naked-bunny/ugly-naked-bunny-animated.gltf',
        position: [0.0, 0.0, 0.0],
        scale: [1, 1, 1],
        rotation: [0.0, 0.0, 0.0],
        image:image,
        src:src,
      }
      const scale = getRandom(1, 2)
      model.scale = [1, 1, 1]
      switch(type){
        case "asset":
        model.path = paths[0]
        model.fill="red"
        break;
        case "block":
        model.path = paths[2]
        model.fill="blue"
        model.scale= [3, 3, 3]
        break;
        case "bunny":
        model.path = paths[1]
        model.fill="green"
        model.scale= [0.5, 0.5, 0.5]
        break;
      }
      let pos = this.data.length
      model.id = pos
      
      if(!position) model.position = [getRandom(1, 10), 0, 0]
      else model.position = [position.x, position.y, 0]
      this.data[model.id] = model
    },
    onUpdatePolygons(polygons){
      console.log("this.polygons.update App",polygons)
      this.polygons = polygons
      console.log("this.polygons.update this App",this.polygons)
    },
    on2DDataUpdated(object) {
      const position = object.position()
      const rotation = object.rotation()
      const scale = object.scale()
      const selected = this.data[object.id()]
      console.log("selected",selected, object)
      selected.position[0] = position.x
      selected.position[1] = position.y
      selected.rotation[1] = rotation
      selected.scale[0] = scale.x
      selected.scale[1] = scale.y
      this.data[selected.id] = selected
    },
    onLinesExtracted(lines) {
      this.extractedLines = lines;
      console.log("App.vue onLines: ", this.extractedLines) // i can see the lines here
    }
  },
  async created(){
    const response = await getObjects()
    console.log("response",response.data)
    if(!response || response.status != 200) return
    for(let i = 0;i<response.data.length;i++){
      let obj = response.data[i]
      obj.id = i
      this.data[i] = obj
    }
  },
  mounted() {
    

    // const model = {
    //   path: 'https://raw.githubusercontent.com/Tresjs/assets/main/models/gltf/ugly-naked-bunny/ugly-naked-bunny-animated.gltf',
    //   position: [0.0, 0.0, 0.0],
    //   scale: [1, 1, 1],
    //   rotation: [0.0, 0.0, 0.0],
    // }
    // for (let pos = 0; pos < 20; pos++) {
    //   let obj = { ...model }
    //   obj.id = pos
    //   obj.path = paths[getRandom(0, 2)]
    //   obj.position = [getRandom(1, 10), 0, 0]
    //   obj.rotation = [0, 0, 0]
    //   const scale = getRandom(1, 2)
    //   obj.scale = [scale, scale, scale]
    //   this.data[obj.id] = obj
    // }
  }
}
</script>
<style scoped>
.tab {
  cursor: pointer;
  padding: 10px;
  margin: 10px;
  min-width: 150px;
  background: white;
  border: 1px #ccc solid;
  text-align: center;
}

.tabs {
  padding: 10px;
  background: #ccc;
  display: flex;
  justify-content: center;
}

.clear {
  margin: 0;
}

.tabs-content{
  display: flex;
}
</style>
