/* Pose class */
class Pose {
    constructor() {
        this.mJoints = []; // array of Transforms
        this.mParents = []; // array of ints (joint indexes)
    }

    /**
        @brief sets the size of the mJoints and mParents arrays
    */
    Resize(size) {
        this.mJoints.length = size;
        this.mParents.length = size;
        for (var i = 0; i < size; ++i) {
            this.mJoints[i] = new Transform();
            this.mParents[i] = 0;
        }
    }
    /**
        @brief returns the length of the mJoints/mParents arrays
    */
    Size() {
        return this.mJoints.length;
    }

    /**
        @brief get and set the parent index of a joint
    */
    GetParent(index) {
        return this.mParents[index];
    }
    SetParent(index, parentIndex) {
        this.mParents[index] = parentIndex;
    }

    /**
        @brief get the local transform of a joint
        @return Transform object of that joint's local transform
    */
    GetLocalTransform(index) {
        return this.mJoints[index];
    }
    /**
        @brief set the local transform of a joint
        @param [transform] the Transform object for that joint
    */
    SetLocalTransform(index, transform) {
        this.mJoints[index].CopyFrom(transform);
    }

    /**
        @brief get the global transform of a joint based on its parent joints
        @return a Transform object of the global/model space transform
    */
    GetGlobalTransform(index) {
        var result = new Transform();
        var tmpResult = new Transform();
        result.CopyFrom(this.mJoints[i]);
        for (var p = this.mParents[i]; p >= 0; p = this.mParents[p]) {

            /* combine current transform and parent transform */
            tmpResult.CopyFrom(result);
            Transform.Combine(result, this.mJoints[p], tmpResult);
        }
        return result;
    }

    /**
        @brief get an array of global transform matrices for each joint
        @return array of mat4s 
    */
    GetMatrixPalette() {
        // TODO
        return [];
    }

    // TODO - == and != operator overloading equivalents

    /**
        @brief set this pose equal to another pose; assignment operator equivalent
        @param [pose] input pose to copy from
    */
    CopyFrom(pose) {
        if (this.mParents.length != pose.mParents.length ||
            this.mJoints.length != pose.mJoints.length) {
            this.Resize(pose.mParents.length);
        }

        for (var i = 0; i < this.mParents.length; ++i) {
            this.mJoints[i].CopyFrom(pose.mJoints[i]);
            this.mParents[i] = pose.mParents[i];
        }
    }
}

