<template>
  <div class="EditMain" ref="filecont" @mousedown="notsee()" >
    <div class="lefttools">
      <p class="text-example">OCR识别</p>
      <div class="uploadimage">
        <p class="commodity_img">
              <el-upload
                :on-success="handleSuccess"
                list-type="picture-card"
                :auto-upload="false"
                :on-change="handleChanges"
                :before-remove="beforeRemove"
                :on-preview="handlePictureCardPreview"
                :file-list="fileList "
                multiple
                limit="1"
                name="img"
              >
                <el-icon class="avatar-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
          </p>
        <el-dialog v-model="dialogVisible">
          <img w-full class="imageshow" :src="dialogImageUrl" alt="Preview Image" />
        </el-dialog>

      </div>
      <hr>
      <el-button type="primary" @click="uploadimg">上传图片</el-button>
      <div class=" showwindow" v-bind:disabled="disabled" id="showwindow">
      </div>
    </div>  
    <div class="editor">
      <div>
        <bubble-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
        <button @click="polish()"
          :class="{ 'is-active': editor.isActive('润色') }">
          <el-icon><Brush /></el-icon>
          优化
        </button>
        <button @click="continuation()"
          :class="{ 'is-active': editor.isActive('续写') }">
          <el-icon><EditPen /></el-icon>
          续写
        </button>
        </bubble-menu>
        <editor-content :editor="editor" />
      </div>
      <div class="editorcard" >
        <div class="toptools">
          <EditorMenu :editor="editor" />
        </div>
        <div class="editcont" >
          <EditorContent
          @scroll="hasscroll()"
          @mousedown="notsee()"
          @mousemove="mousemove()" 
          @mouseup="selecttext($event)"
          style="padding: 8px;  overflow-y: auto;"
          :editor="editor"
        />
        <p></p>
        </div>
        
        <div class="bottomcount">
          字数统计:
          {{ editor?.storage.characterCount.characters() }}
        </div>
      </div>
    </div>
    <div class="righttools">
      <Outline></Outline>
    </div>
  </div>
  </template>
  <script setup lang="ts" >
  import {Brush,EditPen,} from '@element-plus/icons-vue'
  import { defineComponent, onMounted, onBeforeUnmount, ref,watch,reactive } from 'vue';
  import { Editor, EditorContent, useEditor, BubbleMenu  } from '@tiptap/vue-3';
  import { storeToRefs } from 'pinia'
  import Underline from '@tiptap/extension-underline'
 // 列表
  // import TableRow from '@tiptap/extension-table-row'
  // import TableCell from '@tiptap/extension-table-cell'
  // import TableHeader from '@tiptap/extension-table-header'
  import ListItem from '@tiptap/extension-list-item'
  import OrderedList from '@tiptap/extension-ordered-list'
  import BulletList from '@tiptap/extension-bullet-list'
  // 代码
  import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
  import css from 'highlight.js/lib/languages/css'
  import js from 'highlight.js/lib/languages/javascript'
  import ts from 'highlight.js/lib/languages/typescript'
  import html from 'highlight.js/lib/languages/xml'
  import { common, createLowlight } from 'lowlight'
  // 字数统计
  import CharacterCount from '@tiptap/extension-character-count'
  import Heading from '@tiptap/extension-heading'
  import StarterKit from '@tiptap/starter-kit'
  import Placeholder from '@tiptap/extension-placeholder'
  import { UndoRound, MoreHorizOutlined } from '@vicons/material'
  import TaskItem from '@tiptap/extension-task-item'
  import TaskList from '@tiptap/extension-task-list'
  import Outline from './Outline/index.vue'
    // 使用Pinia
  import { useEditorStore } from '@/store'
  import EditorMenu from './EditorMenu/index.vue'
  import ShowWindow from './ShowWindow/index.vue'
  import { defineStore } from 'pinia'
  import { ElMessage } from 'element-plus';
  

  const lowlight = createLowlight()
  lowlight.register({ html, ts, css, js })
    


  onMounted(() => { });

    const aipolish = ref("")
    const filecont = ref(null);
    const aicontinuation = ref("")
    const visiblemenu = ref(false)
    const position = ref({
          top: 0,
          left: 0
    })
    var hasmove=ref(false);
    var hisstring:any;
    var selection:any;
    //进行润色的函数
  import axios from 'axios'
  import { table } from 'console';
    //进行润色的函数
    const polish=()=>{
      visiblemenu.value = false;
      let formData = new FormData();
      if(hisstring==''){
        alert("不能对空的内容进行润色")
      }
      else{
        formData.append("username","123456");
        formData.append("key","01a28a5bdc72092bcf43dd4258c58b05855368f4");
        formData.append("cont",hisstring);
        let url = 'http://127.0.0.1:5000/getpolish' //访问后端接口的url
        let method = 'post'
        axios({
          method,
          url,
          data: formData,
        }).then(res => {
          // alert(res.data.answer)
          console.log(res.data.answer);
          document.getElementById("showwindow").innerText=res.data.answer;
        });
      }
      
    }
    //进行aiaireview
    const continuation=()=>{
      visiblemenu.value = false;
      let formData = new FormData();
      if(hisstring==''){
        alert("不能对空的内容进行润色")
      }
      else{
        formData.append("username","123456");
        formData.append("key","01a28a5bdc72092bcf43dd4258c58b05855368f4");
        formData.append("cont",hisstring);
        let url = 'http://127.0.0.1:5000/getcontinuation' //访问后端接口的url
        let method = 'post'
        axios({
          method,
          url,
          data: formData,
        }).then(res => {
          // alert(res.data.answer)
          console.log(res.data.answer);
          document.getElementById("showwindow").innerText=res.data.answer;
        });
      }
    }
    // 获取选中的文字
    const selecttext= (e:MouseEvent)=>{
            selection = window.getSelection();
            if(selection!=null&&hisstring!=selection){
              var content = selection.toString();
              var rect = filecont.value.getBoundingClientRect();
              visiblemenu.value = true
              position.value.top =  e.clientY;
              position.value.left =e.clientX;
              hisstring=content
            }
      }
    //鼠标移动
    const mousemove=()=>{
            hasmove.value=true;
      }
    //鼠标点击
    const notsee=()=>{
            visiblemenu.value = false;
            // selection.value="";
      }
    const see=()=>{
            visiblemenu.value = true;
            // selection.value="";
      }
    //滚轮滚动
    const hasscroll=()=>{
            visiblemenu.value = false;
            // window.getSelection().removeAllRanges()
      }
    const editorStore = useEditorStore()
     // 加载headings
    const loadHeadings = () => {
          const headings = [] as any[]
          if (!editor.value) return
          const transaction = editor.value.state.tr
          if (!transaction) return

          editor.value?.state.doc.descendants((node, pos) => {
            if (node.type.name === 'heading') {
              console.log(pos, node)
              const start = pos
              const end = pos + node.content.size
              // const end = pos + node
              const id = `heading-${headings.length + 1}`
              if (node.attrs.id !== id) {
                transaction?.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  id
                })
              }

              headings.push({
                level: node.attrs.level,
                text: node.textContent,
                start,
                end,
                id
              })
            }
          })

          transaction?.setMeta('addToHistory', false)
          transaction?.setMeta('preventUpdate', true)

          editor.value?.view.dispatch(transaction)
          editorStore.setHeadings(headings)
      }
    // 使用ref创建可变的响应式引用
    // 编辑器初始化
const editor = useEditor({
          content: ``,
          extensions: [
          StarterKit.configure({
              heading: {
                levels: [1, 2, 3,4,5],
              },
            }),
            TaskList,
            TaskItem,
            Placeholder.configure({
              placeholder: '开始输入文本 …'
            }),
            OrderedList,
            BulletList,
            ListItem,
            CharacterCount.configure({
            limit: 10000
          }),
          
          ],
          onUpdate({ edit }) {
            loadHeadings()
            editorStore.setEditorInstance(editor.value)
          },
          onCreate({ edit }) {
            loadHeadings()
            editorStore.setEditorInstance(editor.value)
          },
          injectCSS: false,

      })
      import { ref } from 'vue'
    import { ElMessage } from 'element-plus';
    import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue'
  
    import type { UploadFile } from 'element-plus'
  
    const dialogImageUrl = ref('')
    const dialogVisible = ref(false)
    const disabled = ref(false)
  
    const handleRemove = (file: UploadFile) => {
      file.url = '';
      file=null;
    }
  
    const handlePictureCardPreview = (file: UploadFile) => {
      dialogImageUrl.value = file.url!
      dialogVisible.value = true
    }
  
    const handleDownload = (file: UploadFile) => {
     
    }
  
    const boxdisplay = ref("show_box");
  
    const upload_btn = ref(false);
    const fileList = ref([]);
    const handleSuccess = () => {
      // 上传成功后，隐藏上传按钮
      upload_btn.value = true;
    };
    const handleChanges = img => {
      fileList.value.push(img);
      boxdisplay.value = "hide_box";
    };
    import {ElMessageBox} from 'element-plus'
import { fa } from 'element-plus/es/locale/index.mjs';
    // 删除
    const beforeRemove = () => {
      const result = new Promise<void>((resolve, reject) => {
        ElMessageBox.confirm("此操作将删除该图片, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            boxdisplay.value = "show_box";
            resolve();
            fileList.value = [];
            upload_btn.value = false;
          })
          .catch(() => {
            reject(false);
          });
      });
      return result;
    };
    const uploadimg = () => {
      // alert("上传图片")
      let formData = new FormData();
        // 遍历fileList，为每个文件创建一个新的表单字段 
      formData.append("username","12345");
      fileList.value.forEach((file, index) => {  
        // 假设后端期望的文件字段名为 'file[]' 以支持多文件上传  
        // 如果后端只期望单个文件，则字段名可能只是 'file'  
        // formData.append(`file[${index}]`, file.raw);  
        formData.append("file",file.raw);
        console.log(file.raw)
      });  
  
      let url = 'http://127.0.0.1:5000/uploadimages' //访问后端接口的url
      let method = 'post'
      axios({
          method,  
          url,  
          data: formData,  
          headers: {  
            'Content-Type': 'multipart/form-data' // 确保设置了正确的Content-Type  
          }  
      }).then(res => {
        console.log(res.data);
        alert(res.data)
          const result = new Promise((resolve, reject) => {
                  resolve();
                  fileList.value = [];
                  upload_btn.value = false;
                  ElMessage({ message: '图片上传成功', type: 'success' });  
                })
                .catch(() => {
                  reject(false);
                });
            });
    }
  </script>
  <style>
  .EditMain{
    position: relative;
    width:100vw;
    height: 100vh;

    display: grid;
    grid-template-columns: 25% 50% 25%;
  
  }
  .lefttools{
    background-color: rgb(111 118 177 / 60%);
    height: 100%;
    width: 100%;
    display: flex; /* 开启 Flexbox 布局 */
    flex-direction: column; /* 子元素垂直排列 */
    align-items: center; /* 垂直居中 */
    padding-top:0rem;
    
  }
  .showwindow{
    height: 23em;
    background-color: rgba(255, 255, 255, 0.6);
    margin: 2em;
    overflow: auto;
  }
  .righttools{
    background-color: rgb(207, 216, 166);
    height: 100%;
    width: 100%;
  }
  .editor{
    max-height: 45rem;
    display: flex;
    padding: 0.7rem;
    flex: auto;
    overflow-y: auto;
    scrollbar-width: 30; 
    scrollbar-color: #888 #f8e6e6;
  }
  .editorcard{
    position: relative;
    width:95%;
    height: 95%;
    left: 2.5%;
    top:2.5%;
    display: grid;
    grid-template-rows: 5% 92% 3%;
    border: 1px solid #4f5c5765;
  }
  .editorcard .editor{
    position: relative;
    width:100%;
    height: 100%;
    left: 0;
    top:0;
    display: grid;
    grid-template-rows: 10% 90%;
  }
  .toptools{
    background-color: rgba(207, 220, 245, 0.199);
    border-bottom: 1px dashed #9ca19f65;
  }
  .bottomcount{
    background-color: rgba(207, 220, 245, 0.199);
    border-top: 1px dashed #9ca19f65;
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
    justify-items: center;
    align-items: center;
  }
  .editcont{
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  </style>
  
  <style lang="scss">
  b {
    font-weight: bold;
  }
  .ProseMirror {
    overflow-y: scroll;
  }
  .ProseMirror p {
    margin: 0;
  }
  .ProseMirror:focus {
    outline: none;
  }
  .tiptap p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
  .tiptap {
    > * + * {
      margin-top: 0.75em;
    }
  
    ul {
      padding: 0 2rem;
      list-style: square;
    }
    ol {
      padding: 0 2rem;
      list-style: decimal;
    }
    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 0;
      overflow: hidden;

      td,
      th {
        min-width: 1em;
        border: 2px solid #ced4da;
        padding: 3px 5px;
        vertical-align: top;
        box-sizing: border-box;
        position: relative;
  
        > * {
          margin-bottom: 0;
        }
      }
  
      th {
        font-weight: bold;
        text-align: left;
        background-color: #f1f3f5;
      }
  
      .selectedCell:after {
        z-index: 2;
        position: absolute;
        content: '';
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(200, 200, 255, 0.4);
        pointer-events: none;
      }
  
      .column-resize-handle {
        position: absolute;
        right: -2px;
        top: 0;
        bottom: -2px;
        width: 4px;
        background-color: #adf;
        pointer-events: none;
      }
  
      p {
        margin: 0;
      }
    }
    pre {
      background: #0d0d0d;
      color: #fff;
      font-family: 'JetBrainsMono', monospace;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
  
      code {
        color: inherit;
        padding: 0;
        background: none;
        font-size: 0.8rem;
      }
  
      .hljs-comment,
      .hljs-quote {
        color: #616161;
      }
  
      .hljs-variable,
      .hljs-template-variable,
      .hljs-attribute,
      .hljs-tag,
      .hljs-name,
      .hljs-regexp,
      .hljs-link,
      .hljs-name,
      .hljs-selector-id,
      .hljs-selector-class {
        color: #f98181;
      }
      .hljs-number,
      .hljs-meta,
      .hljs-built_in,
      .hljs-builtin-name,
      .hljs-literal,
      .hljs-type,
      .hljs-params {
        color: #fbbc88;
      }
  
      .hljs-string,
      .hljs-symbol,
      .hljs-bullet {
        color: #b9f18d;
      }
  
      .hljs-title,
      .hljs-section {
        color: #faf594;
      }
  
      .hljs-keyword,
      .hljs-selector-tag {
        color: #70cff8;
      }
  
      .hljs-emphasis {
        font-style: italic;
      }
  
      .hljs-strong {
        font-weight: 700;
      }
    }
  }
  
  .tableWrapper {
    overflow-x: auto;
  }
  
  .resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }
  .contextmenu {
    width: 120px;
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding:5px;
    padding-left: 15px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.3);
    display: grid;
    grid-template-columns:50% 50%;

  }
  .contextmenu .item {
      height: 35px;
      width:100%;
      line-height: 35px;
      color: rgb(29, 33, 41);
      cursor: pointer;
    }
    .contextmenu .item {
      height: 35px;
      width:100%;
      line-height: 35px;
      color: rgb(29, 33, 41);
      cursor: pointer;
    }

    .contextmenu .item:hover {
      background: rgb(229, 230, 235);
    }
  </style>

<style scoped>
    .mainbody {
      position: relative;
      width:100vw;
      height: 100vh;
      display: block;
    }
    .headtitle {
      filter: drop-shadow(0 0 2em #646cffaa);
      margin: 0;
    }
    </style>
    <style lang="scss" scoped>
    /* #在此处编写代码 */
    .mainbody{
      background: #76cfe5;
    }
    </style>
    <style scoped>
    .hide_box  {
      display: none;
    }
    .show_box{
      display: inline-flex;
    }
    .imageshow{
      width: 100%;  
      height: 100%;  
      object-fit: fill; 
    }
    .uploadimage{
      display: flex;           /* 使用 Flexbox 布局 */
      justify-content: center; /* 水平居中 */
      align-items: center;     /* 垂直居中 */
    }
    .text-example {
    color: rgb(0, 0, 0); /* 设置文本颜色为红色 */
    font-size: 25px; /* 设置文本大小为24像素 */
    margin: 1rem;
    }
    </style>
    