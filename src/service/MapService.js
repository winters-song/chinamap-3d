
const data = require('../assets/data.json')
const node = require('../assets/node.json')

const map = {}
node.content.forEach(item=> {
  if(item.area_id){
    map[item.area_id] = item.id
  }
})

// 地区 adcode 对应节点id
export const areaNodeMap = map

// 节点24小时数据
export const getMapData = () => {
  return data.content
}