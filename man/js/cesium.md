# Cesium

## 载入

### Entity

### Fabric API

```js
const customPrimitive = ({
    id,
    position,
    geometry,
    uniforms,
    shader: {
        material,
        vertex,
        fragment,
    },
}) => {
    const { viewer } = window;
    const geometryInstances = new Cesium.GeometryInstance({
        id,
        geometry,
    })

    const appearance = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
            translucent: false, // 不透明
            fabric: {
                uniforms,
                source: `czm_material czm_getMaterial(czm_materialInput materialInput) {
                    czm_material material = czm_getDefaultMaterial(materialInput);
                    ${material}
                    return material;
                }`,
            }
        }),
        vertexShaderSource: vertex,
        fragmentShaderSource: fragment,
    });

    viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances,
        appearance,
        releaseGeometryInstances: false,
        compressVertices: false,
        modelMatrix: position ? Cesium.Transforms.eastNorthUpToFixedFrame(position) : undefined,
    }));
}

const testShader = () => customPrimitive({
    geometry: new Cesium.CircleGeometry({
        center: Cesium.Cartesian3.fromDegrees(119.3077, 26.0541, 10),
        radius: 100000,
    }),
    // position: Cesium.Cartesian3.fromDegrees(119.3077, 26.0541, 10000),
    // geometry: new Cesium.CylinderGeometry({
    //     length: 400000.0,
    //     topRadius: 0.0,
    //     bottomRadius: 200000.0,
    // }),
    uniforms: {
        fillColor: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 0.1,
    },
    shader: {
        material: `
        // 谁说我 shader 有问题?
        // material.diffuse = vec3(1.0, 0.0, 1.0);

        // 灰白棋盘格
        // vec2 xy = step(fract(materialInput.st * 10.0), vec2(0.5));
        // float strip = 2.0 * fract(0.5 * (xy.x + xy.y));
        // material.diffuse = mix(vec3(0.8), vec3(1.0), strip);

        // 带描边的圆盘
        float dist = length(materialInput.st * 2.0 - 1.0);
        material.diffuse = mix(outlineColor.rgb, fillColor.rgb, step(dist, 1.0 - outlineWidth));
        `,
    },
});
```

### Custom Shader
