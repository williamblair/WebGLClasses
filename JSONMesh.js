/*
 * JSON ThreeJS mesh format/adapted from
 * https://www.amazon.com/WebGL-Game-Development-Sumeet-Arora/dp/1849699798/ref=sr_1_2?dchild=1&keywords=webgl+game+development&qid=1632438302&sr=8-2
 */

Face = function ( a, b, c, normal, color, materialIndex ) {

    this.a = a;
    this.b = b;
    this.c = c;

    this.normal =  normal ;
    this.vertexNormals = [ ];

    this.vertexColors = color instanceof Array ? color : [];
    this.colorIndex = color;

    this.vertexTangents = [];

    this.materialIndex = materialIndex !== undefined ? materialIndex : 0;
};
Face.prototype = {
    constructor: Face
};


class JSONMesh extends Mesh {
//class JSONMesh  {
   
    /**
        @brief JSONMesh constructor
        @param [gl] webgl context
        @param [jsonData] the loaded json model object
    */ 
    constructor(gl, jsonData) {
        var vertices = jsonData.vertices;
        var faces = JSONMesh.parseJSON(gl, jsonData);
        var indices = JSONMesh.getIndicesFromFaces(faces);
        //console.log('json vertices, faces, indices: ',
        //    vertices, 
        //    faces, 
        //    indices
        //);
        if (jsonData.materials.length > 0) {
            // diffuseColor = data.materials[0].colorDiffuse;
        }
        const elementsPerVertex = 3;
        super(gl, vertices, elementsPerVertex, indices);
    }

    static isBitSet( value, position ) {
        return value & ( 1 << position );
    }

    static parseJSON(gl, data) {
        var faceArray = [];
        var i,
            j,
            fi,

            offset,
            zLength,
            nVertices,
            
            colorIndex,
            normalIndex,
            uvIndex,
            materialIndex,

            type,
            isQuad,
            hasMaterial,
            hasFaceUv,
            hasFaceVertexUv,
            hasFaceNormal,
            hasFaceVertexNormal,
            hasFaceColor,
            hasFaceVertexColor,

            vertex,
            face,
            color,
            normal,

            uvLayer,
            uvs,
            u,
            v,

            faces = data.faces,
            vertices = data.vertices,
            normals = data.normals,
            colors = data.colors,

            nUvLayers = 0;

        // disregard empty arrays
        for (i=0; i<data.uvs.length; ++i) {
            if (data.uvs[i].length) ++nUvLayers;
        }

        offset = 0;
        zLength = faces.length;

        while (offset < zLength) {
            type = faces[ offset++ ];

            isQuad              = JSONMesh.isBitSet(type, 0);
            hasMaterial         = JSONMesh.isBitSet(type, 1);
            hasFaceUv           = JSONMesh.isBitSet(type, 2);
            hasFaceVertexUv     = JSONMesh.isBitSet(type, 3);
            hasFaceNormal       = JSONMesh.isBitSet(type, 4);
            hasFaceVertexNormal = JSONMesh.isBitSet(type, 5);
            hasFaceColor        = JSONMesh.isBitSet(type, 6);
            hasFaceVertexColor  = JSONMesh.isBitSet(type, 7);

            if (isQuad) {
                face = new Face();
                face.a = faces[ offset++ ];
                face.b = faces[ offset++ ];
                face.c = faces[ offset++ ];
                face.d = faces[ offset++ ];

                nVertices = 4;
            }
            else {
                face = new Face();
                face.a = faces[ offset++ ];
                face.b = faces[ offset++ ];
                face.c = faces[ offset++ ];

                nVertices = 3;
            }

            if (hasMaterial) {
                materialIndex = faces[ offset++ ];
                face.materialIndex = materialIndex;
            }

            // Just iterating and moving offset index forward; UV not relevant to this chapter
            if (hasFaceUv) {
                for (i=0; i<nUvLayers; ++i) {
                    uvIndex = faces[ offset++ ];
                }
            }
            if (hasFaceVertexUv) {
                for (i=0; i<nUvLayers; ++i) {
                    for (j=0; j<nVertices; ++j) {
                        uvIndex = faces[ offset++ ];
                    }
                }
            }

            if (hasFaceNormal) {
                normalIndex = faces[ offset++ ] * 3;
                normal = vec3.fromValues(
                    normals[ normalIndex++ ],
                    normals[ normalIndex++ ],
                    normals[ normalIndex ]
                );
                face.normal = normal;
            }
            if (hasFaceVertexNormal) {
                for (i=0; i < nVertices; ++i) {
                    normalIndex = faces[ offset++ ]  * 3;
                    normal = vec3.fromValues(
                        normals[ normalIndex++ ],
                        normals[ normalIndex++ ],
                        normals[ normalIndex ]
                    );
                    face.vertexNormals.push(normal); 
                }
            }

            if (hasFaceColor) {
                colorIndex = faces[ offset++ ];
                face.colorIndex = colorIndex;
            }
            if (hasFaceVertexColor) {
                for (i=0; i < nVertices; ++i) {
                    colorIndex = faces[ offset++ ];
                    face.vertexColors.push(colorIndex);
                }
            }
            
            faceArray.push(face);
        } // end while (offset < zLength)

        return faceArray;
    }

    
    static getIndicesFromFaces(faces) {
        var indices = [];
        for (var i=0; i<faces.length; ++i) {
            indices.push(faces[i].a);
            indices.push(faces[i].b);
            indices.push(faces[i].c);
        }
        return indices;
    }
}

