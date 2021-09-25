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
        var normals = JSONMesh.calculateVertexNormals(vertices, indices);
        //console.log('json data: ', jsonData);
        //console.log('json vertices, faces, indices, normals: ',
        //    vertices,
        //    faces,
        //    indices,
        //    normals
        //);
        if (jsonData.materials.length > 0) {
            // diffuseColor = data.materials[0].colorDiffuse;
        }
        // vertices and normals
        const elementsPerVertex = 6;
        var combinedVertices = [];
        if (normals.length != vertices.length) {
            Debug.Error("JSONMesh normals length != vertices length");
        }
        for (var i=0; i < vertices.length; i+=3) {
            combinedVertices.push(vertices[i+0]);
            combinedVertices.push(vertices[i+1]);
            combinedVertices.push(vertices[i+2]);
            combinedVertices.push(normals[i+0]);
            combinedVertices.push(normals[i+1]);
            combinedVertices.push(normals[i+2]);
        }
        super(gl, combinedVertices, elementsPerVertex, indices);
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

    static calculateVertexNormals(vertices, indices)  {
        var vertexVectors = [];
        var normalVectors = [];
        var normals = [];
        var j;
        for (var i=0; i < vertices.length; i+=3) {
            var vector = vec3.fromValues(vertices[i], vertices[i+1], vertices[i+2]);
            var normal = vec3.create();
            normalVectors.push(normal);
            vertexVectors.push(vector);
        }

        try {
            for (j=0; j < indices.length; j+=3) {
                // v1 - v0
                var vec1 = vec3.create();
                vec3.subtract(
                    vec1,
                    vertexVectors[indices[j+1]],
                    vertexVectors[indices[j]]
                );
                // v2 - v1
                var vec2 = vec3.create();
                vec3.subtract(
                    vec2,
                    vertexVectors[indices[j+2]],
                    vertexVectors[indices[j+1]]
                );

                var normal = vec3.create();
                vec3.cross(normal, vec1, vec2);

                // calculate normal from three verts is same for all,
                // then the contribution from each normal to vertex is the same
                vec3.add(normalVectors[indices[j+0]], normalVectors[indices[j+0]], normal);
                vec3.add(normalVectors[indices[j+1]], normalVectors[indices[j+1]], normal);
                vec3.add(normalVectors[indices[j+2]], normalVectors[indices[j+2]], normal);
            }
        } catch (e) {
            Debug.Error(j);
        }

        for (j=0; j < normalVectors.length; ++j) {
            vec3.normalize(normalVectors[j], normalVectors[j]);
            normals.push(normalVectors[j][0]);
            normals.push(normalVectors[j][1]);
            normals.push(normalVectors[j][2]);
        }

        return normals;
    }
}
