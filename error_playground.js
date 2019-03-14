const sum = (a, b) => {
    if(a && b) {

        return a+b;
    }

    throw new Error('Invalid Argument');
}

// [ With Try Catch]
try { console.log(sum(1))} catch(e) { console.log(e) }

console.log('With Try Catch --- wroking here');

/* 
    Error: Invalid Argument
    at sum (C:\Joon_Cloud\OneDrive\myApps\node\2ndPhase\error_handlling\error_playground.js:7:11)
    at Object.<anonymous> (C:\Joon_Cloud\OneDrive\myApps\node\2ndPhase\error_handlling\error_playground.js:11:19)
    at Module._compile (internal/modules/cjs/loader.js:689:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:700:10)
    at Module.load (internal/modules/cjs/loader.js:599:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:538:12)
    at Function.Module._load (internal/modules/cjs/loader.js:530:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:742:12)
    at startup (internal/bootstrap/node.js:283:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:743:3)
    
    wroking here *********************************

*/

// Without Try Catch
console.log(sum(1));

// With Try and Catch, It is still working!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  even though the code is crashed above.
// Without Try and Catch It does not work.!!!!!!!!!!
console.log('Without Try Catch --- not wroking here');
/* 
   Error: Invalid Argument
    at sum (C:\Joon_Cloud\OneDrive\myApps\node\2ndPhase\error_handlling\error_playground.js:7:11)
    at Object.<anonymous> (C:\Joon_Cloud\OneDrive\myApps\node\2ndPhase\error_handlling\error_playground.js:11:19)
    at Module._compile (internal/modules/cjs/loader.js:689:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:700:10)
    at Module.load (internal/modules/cjs/loader.js:599:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:538:12)
    at Function.Module._load (internal/modules/cjs/loader.js:530:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:742:12)
    at startup (internal/bootstrap/node.js:283:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:743:3)
*/


// With Try and Catch, It is still working!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  even though the code is crashed above.
// Without Try and Catch It does not work.!!!!!!!!!!
console.log('Without Try Catch --- not wroking here');
