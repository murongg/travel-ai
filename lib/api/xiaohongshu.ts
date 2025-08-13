import notes from './notes.json'

export class XiaoHongShu {
  public getNotesByKeyword(keyword: string) {
    // mock 数据
    return notes.map(item => item.data.items[0].note_card.desc)
  }
}
