<template>
  <div>
    <demo
      :demoComp="demoComp"
      :demoEvents="demoEvents"
      :demoProps="demoProps"
      :demoClasses="demoClasses"
    ></demo>
  </div>
</template>

<script>
import Demo from '@/views/advanced/page/templates/Demo';

export default {
  components: {
    Demo,
  },
  name: 'IframeDemo',
  data() {
    return {
      demoComp: createComp(),
      demoEvents: [
        {
          name: 'kupIframeError',
          type: 'error',
        },
        {
          name: 'kupIframeLoad',
          type: 'load',
        },
      ],
      demoProps: [
        {
          prop: 'buttonData',
          description: 'Props of the button (when isButton is set to true).',
          type: 'Object',
          default: '{}',
          try: 'json',
        },
        {
          prop: 'isButton',
          description:
            'The component will be rendered as a button, which opens the link associated to the iframe in another tab/window when clicked.',
          type: 'boolean',
          default: 'false',
          try: 'switch',
        },
        {
          prop: 'src',
          description: 'The address the iframe should be referencing to.',
          type: 'string',
          default: 'undefined',
          try: 'field',
        },
      ],
      demoClasses: [
        {
          class: 'kup-secondary-color',
          description:
            'The component will be rendered using the secondary color of the app.',
        },
      ],
    };
  },
};

function createComp() {
  let comp = document.createElement('kup-iframe');
  comp.buttonData = {
    flat: true,
  };
  comp.id = 'demo-component';
  comp.src = 'https://ketchup.smeup.com';
  return comp;
}
</script>
