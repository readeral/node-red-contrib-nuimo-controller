# node-red-contrib-nuimo-controller

A Node Red node for taking input from a Nuimo controller, and outputting to the 9x9 led array.

Based on [Nuimo.js](https://github.com/nathankellenicki/nuimojs) by [@nathankellenicki](https://github.com/nathankellenicki) which utilises the Noble BLE library by Sandeep Mistry.

Adds
- an output node for all control events,
- a pass-through input node for updating the 9x9 array (either by a msg.array, or via the nodes settings gui)
- a config node for initialising the bluetooth connection

