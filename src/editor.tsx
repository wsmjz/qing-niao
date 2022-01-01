
import './editor.scss'
import EditorBlock from './editor-block'
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { Button, Dropdown } from "antd";
// 1.实现菜单的拖拽功能
const { dragstart, dragend } = useMenuDragger(containerRef, data);

// 2.实现获取焦点 选中后可能直接就进行拖拽了
let { blockMousedown, focusData, containerMousedown, lastSelectBlock, clearBlockFocus } = useFocus(data, previewRef, (e) => {
	// 获取焦点后进行拖拽
	mousedown(e)
});
// 2.实现组件拖拽
let { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data);

const { commands } = useCommand(data, focusData); // []
const buttons = [
	{ label: '撤销', icon: 'icon-back', handler: () => commands.undo() },
	{ label: '重做', icon: 'icon-forward', handler: () => commands.redo() },
	{
		label: '导出', icon: 'icon-export', handler: () => {
			alert('导出')
		}
	},
	{
		label: '导入', icon: 'icon-import', handler: () => {
			alert('导入')
		}
	},
	{ label: '置顶', icon: 'icon-place-top', handler: () => commands.placeTop() },
	{ label: '置底', icon: 'icon-place-bottom', handler: () => commands.placeBottom() },
	{ label: '删除', icon: 'icon-delete', handler: () => commands.delete() },


	{
		label: () => previewRef.value ? '编辑' : '预览', icon: () => previewRef.value ? 'icon-edit' : 'icon-browse', handler: () => {
			previewRef.value = !previewRef.value;
			clearBlockFocus();
		}
	},
	{
		label: '关闭', icon: 'icon-close', handler: () => {
			editorRef.value = false;
			clearBlockFocus();
		}
	},
];

const onContextMenuBlock = (e, block) => {
	e.preventDefault();

	$dropdown({
		el: e.target, // 以哪个元素为准产生一个dropdown
		content: () => {
			return <>
				<DropdownItem label="删除" icon="icon-delete" onClick={() => commands.delete()}></DropdownItem>
				<DropdownItem label="置顶" icon="icon-place-top" onClick={() => commands.placeTop()}></DropdownItem>
				<DropdownItem label="置底" icon="icon-place-bottom" onClick={() => commands.placeBottom()}></DropdownItem>
				<DropdownItem label="查看" icon="icon-browse" onClick={() => {
					$dialog({
						title: '查看节点数据',
						content: JSON.stringify(block)
					})
				}}></DropdownItem>
				<DropdownItem label="导入" icon="icon-import" onClick={() => {
					$dialog({
						title: '导入节点数据',
						content: '',
						footer: true,
						onConfirm(text) {
							text = JSON.parse(text);
							commands.updateBlock(text, block)
						}
					})
				}}></DropdownItem>
			</>
		}
	})
}

const Editor = () => {
	return (
		<div class="editor">
			<div class="editor-left">
				{/* 根据注册列表 渲染对应的内容  可以实现h5的拖拽*/}
				<span>组件区域</span>
			</div>
			<div class="editor-top">
				<span>功能区</span>
			</div>
			<div class="editor-right">
				<EditorOperator
					block={lastSelectBlock.value}
					data={data.value}
					updateContainer={commands.updateContainer}
					updateBlock={commands.updateBlock}
				></EditorOperator>
			</div>
			<div class="editor-container">
				{/*  负责产生滚动条 */}
				<div class="editor-container-canvas">
					{/* 产生内容区域 */}
					<div
						class="editor-container-canvas__content"
						style={containerStyles.value}
						ref={containerRef}
						onMousedown={containerMousedown}

					>
						{
							(data.value.blocks.map((block, index) => (
								<EditorBlock
									class={block.focus ? 'editor-block-focus' : ''}
									class={previewRef.value ? 'editor-block-preview' : ''}
									block={block}
									onMousedown={(e) => blockMousedown(e, block, index)}
									onContextmenu={(e) => onContextMenuBlock(e, block)}
									formData={props.formData}
								></EditorBlock>
							)))
						}

						{markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
						{markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}

					</div>

				</div>
			</div>
		</div>
	)
}