/* Object class */

class glObject
{
    /*
     * Constructor 
     */
    constructor(vertices, itemSize, numItems)
    {
        /* Create the vertex buffer */
        this.vertexBuffer = this.createBuffer(gl.ARRAY_BUFFER, new Float32Array(vertices), itemSize, numItems);
    }

    /* 
     * Bind the buffers for drawing
     */
    bind(shader) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexAttrib, this.vertexBuffer.itemSize, gl.FLOAT, false, 0,0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
    }

    /*
     * Draw either elements or arrays depending on what was given
     */
    draw() {

        if (this.elementBuffer !== undefined) {
            gl.drawElements(gl.TRIANGLES, this.elementBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }

        else {
            gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);
        }
    }

    /*
     * Create an element buffer
     */
    createElementBuffer(elements, itemSize, numItems) {
        this.elementBuffer = this.createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elements), itemSize, numItems);
    }

    /*
     * Create a color buffer
     */
    createColorBuffer(colors, itemSize, numItems) {
        this.colorBuffer = this.createBuffer(gl.ARRAY_BUFFER, new Float32Array(colors), itemSize, numItems);
    }

    /*
     * Internal class function to create a gl buffer
     */
    createBuffer(type, data, itemSize, numItems) {
        var buffer = gl.createBuffer();
        
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, data, gl.STATIC_DRAW);
        
        buffer.itemSize = itemSize;
        buffer.numItems = numItems;

        return buffer;
    }
};

