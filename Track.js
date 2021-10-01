class Vec3Track {
  constructor(frames, interpolation) {
    frames = frames || [];
    interpolation = interpolation || Interpolation.Linear;
    this.mFrames = []; // this should be filled with Vec3Frames
    for (var i=0; i<frames.length; ++i) {
        this.mFrames.push(new Vec3Frame(
          frames[i].mValue,
          frames[i].mIn,
          frames[i].mOut,
          frames[i].mTime,
        ));
    }
    this.mInterpolation = interpolation;
  }
  GetStartTime() {
    return this.mFrames[0].mTime;
  }
  GetEndTime() {
    return this.mFrames[this.mFrames.length-1].mTime;
  }
  /**
    @brief return interpolated track frame at given time t
    @param [t] time between GetStartTime() and GetEndTime()
    @param [looping] boolean wether to wrap around if t before/after track
  */
  Sample(t, looping) {
    switch (this.mInterpolation) {
      case Interpolation.Constant: return this.SampleConstant(t, looping);
      case Interpolation.Linear: return this.SampleLinear(t, looping);
      case Interpolation.Cubic: return this.SampleCubic(t, looping);
    }
    return this.SampleConstant(t, looping);
  }
  SampleConstant(t, looping) {
    var frame = this.frameIndex(t, looping);
    if (frame < 0 || frame >= this.mFrames.length) {
      return vec3.fromValues(0.0, 0.0, 0.0);
    }
    return vec3.fromValues(
        this.mFrames[frame].mValue[0],
        this.mFrames[frame].mValue[1],
        this.mFrames[frame].mValue[2]
    );
  }
  SampleLinear(t, looping) {
    var thisFrame = this.frameIndex(t, looping);
    if (thisFrame < 0 || thisFrame >= this.mFrames.length - 1) {
      // TODO error
      return vec3.fromValues(0.0, 0.0, 0.0);
    }

    var nextFrame = thisFrame + 1;
    var trackTime = this.adjustTimeToFitTrack(t, looping);
    var thisTime = this.mFrames[thisFrame].mTime;
    var frameDelta = this.mFrames[nextFrame].mTime - thisTime;
    if (frameDelta <= 0.0) {
      return vec3.fromValues(0.0, 0.0, 0.0);
    }

    var time = (trackTime - thisTime) / frameDelta;
    var start = vec3.fromValues(
      this.mFrames[thisFrame].mValue[0],
      this.mFrames[thisFrame].mValue[1],
      this.mFrames[thisFrame].mValue[2]
    );
    var end = vec3.fromValues(
      this.mFrames[nextFrame].mValue[0],
      this.mFrames[nextFrame].mValue[1],
      this.mFrames[nextFrame].mValue[2]
    );
    vec3.lerp(end, start, end, time);
    return end;
  }
  SampleCubic(t, looping) {
    var thisFrame = this.frameIndex(t, looping);
    if (thisFrame < 0 || thisFrame >= this.mFrames.length - 1) {
      // TODO error
      return vec3.fromValues(0.0, 0.0, 0.0);
    }

    var nextFrame = thisFrame + 1;
    var trackTime = this.adjustTimeToFitTrack(t, looping);
    var thisTime = this.mFrames[thisFrame].mTime;
    var frameDelta = this.mFrames[nextFrame].mTime - thisTime;
    if (frameDelta <= 0.0) {
      return vec3.fromValues(0.0, 0.0, 0.0);
    }

    var time = (trackTime - thisTime) / frameDelta;

    //memcpy(dest,src,amount)
    var point1 = vec3.fromValues(
      this.mFrames[thisFrame].mValue[0],
      this.mFrames[thisFrame].mValue[1],
      this.mFrames[thisFrame].mValue[2]
    );
    var slope1 = vec3.fromValues(
      this.mFrames[thisFrame].mOut[0],
      this.mFrames[thisFrame].mOut[1],
      this.mFrames[thisFrame].mOut[2]
    );
    vec3.scale(slope1, slope1, frameDelta);

    var point2 = vec3.fromValues(
      this.mFrames[nextFrame].mValue[0],
      this.mFrames[nextFrame].mValue[1],
      this.mFrames[nextFrame].mValue[2]
    );
    var slope2 = vec3.fromValues(
      this.mFrames[nextFrame].mOut[0],
      this.mFrames[nextFrame].mOut[1],
      this.mFrames[nextFrame].mOut[2]
    );
    vec3.scale(slope2, slope2, frameDelta);

    return this.hermite(time, point1, slope1, point2, slope2);
  }

  GetStartTime() {
    return this.mFrames[0].mTime;
  }
  GetEndTime() {
    return this.mFrames[this.mFrames.length - 1].mTime;
  }

  /**
    @brief resize the internal mFrames array with Vec3Frames
    @param [size] the number of frames to resize mFrames to
  */
  Resize(size) {
    this.mFrames.length = size;
    for (var i = 0; i < this.mFrames.length; ++i) {
      this.mFrames[i] = new Vec3Frame();
    }
  }

  /**
    @brief hermite interpolation helper function
  */
  hermite(t, p1, s1, p2, s2) {
    const tt = t*t;
    const ttt = tt*t;
    const h1 = 2.0*ttt - 3.0*tt + 1.0;
    const h2 = -2.0*ttt + 3.0*tt;
    const h3 = ttt - 2.0 * tt + t;
    const h4 = ttt - tt;
    var p1h1 = vec3.create(); vec3.scale(p1h1, p1, h1);
    var p2h2 = vec3.create(); vec3.scale(p2h2, p2, h2);
    var s1h3 = vec3.create(); vec3.scale(s1h3, s1, h3);
    var s2h4 = vec3.create(); vec3.scale(s2h4, s2, h4);
    vec3.add(p1h1, p1h1, p2h2);
    vec3.add(p1h1, p1h1, s1h3);
    vec3.add(p1h1, p1h1, s2h4);
    return p1h1;
  }

  /**
    @brief helper function;
           calculates the nearest frame to the left of the input time
  */
  frameIndex(t, looping) {
    const size = this.mFrames.length;
    if (size <= 1) {
      return -1;
    }
    var time = t;
    if (looping) {
      const startTime = this.mFrames[0].mTime;
      const endTime = this.mFrames[size - 1].mTime;
      const duration = endTime - startTime;
      //time = (time - startTime) % duration;
      time = time - startTime;
      while (time > duration) {
        time -= duration;
      }
      while (time < 0) {
        time += duration;
      }
      time = time + startTime;
    }
    // no looping
    else {
      if (time <= this.mFrames[0].mTime) {
        return 0;
      }
      // we'll need to sample the next frame as well, hence -2
      if (time >= this.mFrames[size - 2].mTime) {
        return size - 2;
      }
    }

    for (var i = size - 1; i >=0; --i) {
      if (time >= this.mFrames[i].mTime) {
        return i;
      }
    }

    // invalid code; should never reach!
    return -1;
  }
  /**
    @brief helper function to limit input time within track range
  */
  adjustTimeToFitTrack(t, looping) {
    const size = this.mFrames.length;
    if (size <= 1) {
      return 0.0;
    }
    var time = t;
    const startTime = this.mFrames[0].mTime;
    const endTime = this.mFrames[size - 1].mTime;
    const duration = endTime - startTime;
    if (duration <= 0.0) {
      return 0.0;
    }
    if (looping) {
      time = time - startTime;
      while (time < duration) {
        time += duration;
      }
      while (time > duration) {
        time -= duration;
      }
      time = startTime + time;
    }
    // no looping
    else {
      if (time < startTime) {
        time = startTime;
      }
      if (time > endTime) {
        time = endTime;
      }
    }
    
    return time;
  }
} // end Vec3Track class

class QuatTrack {
  constructor() {
    this.mFrames = []; // this should be filled with QuatFrames
    this.mInterpolation = Interpolation.Linear; // default
  }
  GetStartTime() {
    return this.mFrames[0].mTime;
  }
  GetEndTime() {
    return this.mFrames[this.mFrames.length-1].mTime;
  }
  /**
    @brief return interpolated track frame at given time t
    @param [t] time between GetStartTime() and GetEndTime()
    @param [looping] boolean wether to wrap around if t before/after track
  */
  Sample(t, looping) {
    switch (this.mInterpolation) {
      case Interpolation.Constant: return this.SampleConstant(t, looping);
      case Interpolation.Linear: return this.SampleLinear(t, looping);
      case Interpolation.Cubic: return this.SampleCubic(t, looping);
    }
    return this.SampleConstant(t, looping);
  }
  SampleConstant(t, looping) {
    var frame = this.frameIndex(t, looping);
    if (frame < 0 || frame >= this.mFrames.length) {
      return quat.create();
    }
    return quat.fromValues(
        this.mFrames[frame].mValue[0],
        this.mFrames[frame].mValue[1],
        this.mFrames[frame].mValue[2],
        this.mFrames[frame].mValue[3]
    );
  }
  SampleLinear(t, looping) {
    var thisFrame = this.frameIndex(t, looping);
    if (thisFrame < 0 || thisFrame >= this.mFrames.length - 1) {
      // TODO error
      return quat.create();
    }

    var nextFrame = thisFrame + 1;
    var trackTime = this.adjustTimeToFitTrack(t, looping);
    var thisTime = this.mFrames[thisFrame].mTime;
    var frameDelta = this.mFrames[nextFrame].mTime - thisTime;
    if (frameDelta <= 0.0) {
      return quat.create();
    }

    var time = (trackTime - thisTime) / frameDelta;
    var start = quat.fromValues(
      this.mFrames[thisFrame].mValue[0],
      this.mFrames[thisFrame].mValue[1],
      this.mFrames[thisFrame].mValue[2],
      this.mFrames[thisFrame].mValue[3]
    );
    var end = quat.fromValues(
      this.mFrames[nextFrame].mValue[0],
      this.mFrames[nextFrame].mValue[1],
      this.mFrames[nextFrame].mValue[2],
      this.mFrames[nextFrame].mValue[3]
    );
    quat.lerp(end, start, end, time);
    return end;
  }
  SampleCubic(t, looping) {
    var thisFrame = this.frameIndex(t, looping);
    if (thisFrame < 0 || thisFrame >= this.mFrames.length - 1) {
      // TODO error
      return quat.create();
    }

    var nextFrame = thisFrame + 1;
    var trackTime = this.adjustTimeToFitTrack(t, looping);
    var thisTime = this.mFrames[thisFrame].mTime;
    var frameDelta = this.mFrames[nextFrame].mTime - thisTime;
    if (frameDelta <= 0.0) {
      return quat.create();
    }

    var time = (trackTime - thisTime) / frameDelta;

    //memcpy(dest,src,amount)
    var point1 = quat.fromValues(
      this.mFrames[thisFrame].mValue[0],
      this.mFrames[thisFrame].mValue[1],
      this.mFrames[thisFrame].mValue[2],
      this.mFrames[thisFrame].mValue[3]
    );
    var slope1 = quat.fromValues(
      this.mFrames[thisFrame].mOut[0],
      this.mFrames[thisFrame].mOut[1],
      this.mFrames[thisFrame].mOut[2],
      this.mFrames[thisFrame].mOut[3]
    );
    quat.scale(slope1, slope1, frameDelta);

    var point2 = quat.fromValues(
      this.mFrames[nextFrame].mValue[0],
      this.mFrames[nextFrame].mValue[1],
      this.mFrames[nextFrame].mValue[2],
      this.mFrames[nextFrame].mValue[3]
    );
    var slope2 = quat.fromValues(
      this.mFrames[nextFrame].mOut[0],
      this.mFrames[nextFrame].mOut[1],
      this.mFrames[nextFrame].mOut[2],
      this.mFrames[nextFrame].mOut[3]
    );
    quat.scale(slope2, slope2, frameDelta);

    return this.hermite(time, point1, slope1, point2, slope2);
  }

  GetStartTime() {
    return this.mFrames[0].mTime;
  }
  GetEndTime() {
    return this.mFrames[this.mFrames.length - 1].mTime;
  }

  /**
    @brief resize the internal mFrames array with Vec3Frames
    @param [size] the number of frames to resize mFrames to
  */
  Resize(size) {
    this.mFrames.length = size;
    for (var i = 0; i < this.mFrames.length; ++i) {
      this.mFrames[i] = new QuatFrame();
    }
  }

  /**
    @brief hermite interpolation helper function
  */
  hermite(t, p1, s1, p2, s2) {
    var tt = t*t;
    var ttt = tt*t;
    var tmpP2 = quat.clone(p2);
    this.neighborhood(p1, tmpP2);

    var h1 = 2.0 * ttt - 3.0 * tt + 1.0;
    var h2 = -2.0 * ttt + 3.0 * tt;
    var h3 = ttt - 2.0 * tt + t;
    var h4 = ttt - tt;

    var p1h1 = quat.create(); quat.scale(p1h1, p1, h1);
    var p2h2 = quat.create(); quat.scale(p2h2, tmpP2, h2);
    var s1h3 = quat.create(); quat.scale(s1h3, s1, h3);
    var s2h4 = quat.create(); quat.scale(s2h4, s2, h4);
    quat.add(p1h1, p1h1, p2h2);
    quat.add(p1h1, p1h1, s1h3);
    quat.add(p1h1, p1h1, s2h4);
    this.adjustHermiteResult(p1h1);
    return p1h1;
  }

  neighborhood(a, b) {
    if (quat.dot(a, b) < 0) {
      quat.scale(b, b, -1);
    }
  }
  adjustHermiteResult(q) {
    quat.normalize(q, q);
  }

  /**
    @brief helper function;
           calculates the nearest frame to the left of the input time
  */
  frameIndex(t, looping) {
    const size = this.mFrames.length;
    if (size <= 1) {
      return -1;
    }
    var time = t;
    if (looping) {
      const startTime = this.mFrames[0].mTime;
      const endTime = this.mFrames[size - 1].mTime;
      const duration = endTime - startTime;
      //time = (time - startTime) % duration;
      time = time - startTime;
      while (time > duration) {
        time -= duration;
      }
      while (time < 0) {
        time += duration;
      }
      time = time + startTime;
    }
    // no looping
    else {
      if (time <= this.mFrames[0].mTime) {
        return 0;
      }
      // we'll need to sample the next frame as well, hence -2
      if (time >= this.mFrames[size - 2].mTime) {
        return size - 2;
      }
    }

    for (var i = size - 1; i >=0; --i) {
      if (time >= this.mFrames[i].mTime) {
        return i;
      }
    }

    // invalid code; should never reach!
    return -1;
  }
  /**
    @brief helper function to limit input time within track range
  */
  adjustTimeToFitTrack(t, looping) {
    const size = this.mFrames.length;
    if (size <= 1) {
      return 0.0;
    }
    var time = t;
    const startTime = this.mFrames[0].mTime;
    const endTime = this.mFrames[size - 1].mTime;
    const duration = endTime - startTime;
    if (duration <= 0.0) {
      return 0.0;
    }
    if (looping) {
      time = time - startTime;
      while (time < 0) {
        time += duration;
      }
      while (time > duration) {
        time -= duration;
      }
      time = startTime + time;
    }
    // no looping
    else {
      if (time < startTime) {
        time = startTime;
      }
      if (time > endTime) {
        time = endTime;
      }
    }
    
    return time;
  }
} // end QuatTrack class

class TransformTrack {
  constructor() {
    this.mId = 0;
    this.mPosition = new Vec3Track();
    this.mRotation = new QuatTrack();
    this.mScale = new Vec3Track();
  }

  GetStartTime() {
    var result = 0.0;
    var isSet = false;
    if (this.mPosition.mFrames.length > 1) {
      result = this.mPosition.GetStartTime();
      isSet = true;
    }
    if (this.mRotation.mFrames.length > 1) {
      const rotationStart = this.mRotation.GetStartTime();
      if (rotationStart < result || !isSet) {
        result = rotationStart;
        isSet = true;
      }
    }
    if (this.mScale.mFrames.length > 1) {
      const scaleStart = this.mScale.GetStartTime();
      if (scaleStart < result || !isSet) {
        result = scaleStart;
        isSet = true;
      }
    }
    return result;
  }
  GetEndTime() {
    var result = 0.0;
    var isSet = false;
    if (this.mPosition.mFrames.length > 1) {
      result = this.mPosition.GetEndTime();
      isSet = true;
    }
    if (this.mRotation.mFrames.length > 1) {
      const rotationEnd = this.mRotation.GetEndTime();
      if (rotationEnd > result || !isSet) {
        result = rotationEnd;
        isSet = true;
      }
    }
    if (this.mScale.mFrames.length > 1) {
      const scaleEnd = this.mScale.GetEndTime();
      if (scaleEnd > result || !isSet) {
        result = scaleEnd;
        isSet = true;
      }
    }
    return result;
  }
  IsValid() {
    return this.mPosition.mFrames.length > 1 ||
           this.mRotation.mFrames.length > 1 ||
           this.mScale.mFrames.length > 1;
  }

  /**
    @brief sample the track at a given time
    @param [ref] If an internal track is invalid, the part from this reference
                 will be used instead (position, rotation, or scale)
    @param [time] the time to sample at (between 0 and 1)
    @param [looping] bool wether to wrap around sample time before/after duration
    @return a sampled Transform object
  */
  Sample(ref, time, looping) {
    /* Default to reference values */
    var result = new Transform();
    vec3.copy(result.mPosition, ref.mPosition);
    quat.copy(result.mRotation, ref.mRotation);
    vec3.copy(result.mScale, ref.mScale);

    /* Only sample if valid */
    if (this.mPosition.mFrames.length > 1) {
      result.mPosition = this.mPosition.Sample(time, looping);
    }
    if (this.mRotation.mFrames.length > 1) {
      result.mRotation = this.mRotation.Sample(time, looping);
    }
    if (this.mScale.mFrames.length > 1) {
      result.mScale = this.mScale.Sample(time, looping);
    }

    return result;
  }
} // end TransformTrack class


