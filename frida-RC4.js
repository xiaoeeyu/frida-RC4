function activeinvokesub_89F4(content1, content2){
    var offset = 0x89F4 + 1;
    var nativelibmodule = Process.getModuleByName("libnative-lib.so");
    var sub_89F4addr = nativelibmodule.base.add(offset);

    var arg0 = Memory.allocUtf8String(content1);
    var arg1 = Memory.allocUtf8String(content2);

    var sub_89F4 = new NativeFunction(sub_89F4addr, 'void', ['pointer', 'pointer']);
    console.log("input_arg0: ",hexdump(arg0),'\n input_agr1: ', hexdump(arg1));
    console.log('====================================');
    var result = sub_89F4(arg0, arg1);
    console.log("result_arg0: ",hexdump(arg0),'\n result_arg1: ', hexdump(arg1));
}

function hooklibnativelib(){
    //   sub_86D8((int)v7, (int)a1, v4);
    //   sub_88B8(v7, a2, v2);
    var nativelibmodule = Process.getModuleByName("libnative-lib.so");
    var sub_86D8addr = nativelibmodule.base.add(0x86D8 + 1);
    var sub_88B8addr = nativelibmodule.base.add(0x88B8 + 1);

    Interceptor.attach(sub_86D8addr, {
        onEnter: function(args){
            console.log("RC4_init onEnter");
            console.log("key: ", hexdump(args[1]),"\n keyLen: ", args[2]);
        },onLeave:function(retval){
            console.log("RC4_init onLeave");
        }
    })
    Interceptor.attach(sub_88B8addr, {
        onEnter: function(args){
            this.arg1 = args[1];
            console.log("RC4_crypt onEnter");
            console.log("content: ", hexdump(args[1]), "\n contentLen: ", args[2]);
        },onLeave:function(retval){
            console.log("RC4_crypt onLeave");
            console.log("cryptResult: ", hexdump(this.arg1));
        }
    })
}

function main(){
    if(Java.available){
        Java.perform(function(){
            var RuntimeClass = Java.use("java.lang.Runtime");
            RuntimeClass.loadLibrary0.implementation = function(arg0,arg1){
                var result = this.loadLibrary0(arg0, arg1);
                console.log("loadLibrary0: ", arg1);
                if(arg1.indexOf("native-lib") != -1){
                    hooklibnativelib();
                }
                return result;
            }
        })
    }
}

setImmediate(main);
