# node-red-contrib-nuimo-controller

A Node Red node for outputting events from a Nuimo controller, and sending updates to the 9x9 led array.

Based on [Nuimo.js](https://github.com/nathankellenicki/nuimojs) by [@nathankellenicki](https://github.com/nathankellenicki) which utilises the [Noble BLE library](https://github.com/noble/noble) by [@sandeepmistry](https://github.com/sandeepmistry/).

## Installation
**Installation may have a few steps depending on your platform.**
As this library depends on Noble, there may be some specific requirements for your platform. [Please review the prerequisites for Noble](https://github.com/noble/noble#prerequisites) prior to installing the nodes.

Installing the nodes into node red should be relatively straight forward, either search for 'nuimo' in the manage palette menu, or
`npm install node-red-contrib-nuimo-controller`

A sample flow [can be found here.](https://flows.nodered.org/flow/43a6b015c2e5fce1a0ffa5305364c27b)

## Provides
-   a config node for initialising the bluetooth connection
-   an interface node which represents the Nuimo controller on the flow canvas
-   an app node to define the apps controllable by the Nuimo, and their corresponding 9x9 LED array image
-   an input node for all control events - within which you define the app it responds to
-   a pass-through output node for updating the 9x9 array (either by a msg.array, or via the nodes settings gui)

Documentation is still being written, but the code has been fairly extensively commented so should provide some guidance in the meantime.

## Implementing the nodes
Typically at a minimum you'll need on your canvas:
-   A Nuimo interface node (you only need one - and in fact things will probably break if you have more than one)
-   A Nuimo app node (but you can have as many as you find practical)
-   A Nuimo listener node for every app node you've created

1.  Give all your app nodes unique names (this is important) and images and wire them into the interface node
2.  Create the same number of listener nodes as you have app nodes you want to use
3.  Deploy your changes so the interface node can produce the list of available apps
4.  Having deployed, you'll now be able to use the config of your listener nodes to select which app the node will respond to. You can think of these as being set to channels only receiving events from the controller on the selected channel.
5.  Wire up the listener node to your favourite nodes (such as Philips Hue, Wemo, Lifx, Homebridge, Xiaomi, WoL, anything really) - making use of all the listeners available to you. **Your best bet while there isn't enough documentation would be to wire up a single debug node on the output of the listener, and play with the controller to see the variety of messages that are produced**

## Using apps
Like the original vision for the Nuimo controller, this node red implementation has enabled multiple different devices to be controlled by the nuimo. I've chosen to call these 'apps', but there's probably a better name for them.
To use the Nuimo with these nodes, you need at least one app node plugged into the interface node, but you're likely to have more.
The app config interface provides you with:
-   App name
-   App type (currently unused/not hooked up to any functional purpose)
-   String input (mirrored exactly by the GUI input)
-   GUI input (as above, mirrors exactly into the String input)
Using this config, set a unique name for your app, and click the circles on the GUI input to define the image that will be output to the Nuimo's display for your app. You can use the presets as a starting point (or just use them outright), or if you want to define the 81 LEDs manually, you can feel free to use the String input box instead.
Once you've defined your apps and plugged them in, you'll want to activate these apps - do so by deploying.

## Invoking the app switcher
Unlike the original Nuimo approach (which used a swiping action to change which device was being controlled) I've opted for something a little more scalable for people who want to control a solid number of smart home devices.
To switch between apps:
-   Long press the physical button of the Nuimo, until a 5 pixel bar appears on the LED array
-   Wait a moment, and the array will change to a flashing representation of the currently active app
-   Using the rotary encoder, turn quickly to switch between app options - either forward or backward will cycle in that direction around the available options. (Adjusting the sensitivity of the app switcher is coming - the settings already exist in the interface node but haven't been properly tested yet)
-   Once you arrive at the app you want to use, click the physical button again which will set the active app. The image will pause for two seconds and then disappear, confirming that you've chosen your new active app

## Listeners
When it comes to processing the input from the Nuimo, I've left this largely up to the end user. Maybe eventually I'll create some helper nodes for some common actions. All actions of the Nuimo are available to you:
-   Button press
-   Rotate
-   Swipe
-   Touch
-   Long touch (coming on the same topic as Touch)
-   Fly (when the sensor is activated with a long touch on the top)
-   Distance (when the sensor is activated with a long touch on the top)
You receive unadulterated event data from the Nuimo for all these actions, with the exception of button press. 'Press' is actually triggered on 'Release' in order to implement the long-press app switcher function. This means you're unable to program your own button holding rules, but I hope this trade-off is a small price to pay for a nicer app switcher. Maybe down the track I'll program the option to change how the app switcher is invoked.

### Known issues yet to be fixed
-   Currently node-red needs to be stopped and restarted if the latest deploy was a 'full' deploy, due to the config node (which maintains the bluetooth connection) not cleaning up properly. **To get around this problem on the regular, make use of the Modified Flows deployment option**, unless you've made changes to the config node, in which case you'll have to restart Node Red. (N.b This is related to an [outstanding pull request on the Noble BLE library](https://github.com/noble/noble/pull/577), so likely won't be resolved until it is merged )
-   If activeApp (in the global context) is updated programatically rather than through the Nuimo controller, then you lose the ability to bring up the app switcher. Until this is resolved, avoid changing that variable via function nodes.

### Contribution guide
As this is a new project, the only pull requests that will be considered are updates to the documentation, minor error fixes in the code, and minor feature enhancements (like matrix array preset options)
As I'm a relatively new javascript developer, requests for refactoring with promises/async/await etc. will require significant explanation of the benefits for the change if a pull request is to be considered. specific use cases applicable to your unique project will probably be unlikely to be considered for inclusion. rewriting in typescript is out of the question at this stage (i dont have time to learn it. Requests for tests are warmly encouraged, pending a discussion on a suitable testing approach.
