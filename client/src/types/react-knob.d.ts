declare module 'react-knob' {
  import * as React from 'react';

  interface KnobProps {
    size?: number;
    angleOffset?: number;
    angleRange?: number;
    min?: number;
    max?: number;
    step?: number;
    value: number;
    onChange: (value: number) => void;
    fgColor?: string;
    bgColor?: string;
  }

  const Knob: React.FC<KnobProps>;
  export default Knob;
}
