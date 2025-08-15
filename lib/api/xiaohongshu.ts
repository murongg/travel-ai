export type TikHubRoot<T = Record<string, any>> = {
  code: number
  request_id: string
  router: string
  params: {
    keyword: string
    page: string
    sort_type: string
    filter_note_type: string
    filter_note_time: string
  }
  data: {
    code: number
    success: boolean
    msg: string
    data: T
    searchId: string
    sessionId: string
  }
}

export type TikHubNotes = TikHubRoot<{
  request_dqa_instant: boolean
  can_cut: boolean
  items: Array<{
    model_type: string
    note: {
      timestamp: number
      last_update_time: number
      cover_image_index: number
      shared_count: number
      desc: string
      liked_count: number
      tag_info: {
        title: string
        type: string
      }
      images_list: Array<{
        original: string
        trace_id: string
        need_load_original_image: boolean
        fileid: string
        height: number
        width: number
        url: string
        url_size_large: string
        live_photo?: {
          media: {
            video_id: number
            video: {
              opaque1: {
                domestic: string
                livephoto_flag: string
              }
              width: number
              height: number
              duration: number
              hdr_type: number
              drm_type: number
              stream_types: Array<number>
              biz_name: number
              biz_id: string
              bound: Array<{
                x: number
                y: number
                w: number
                h: number
              }>
            }
            stream: {
              h264: Array<any>
              h265: Array<{
                backup_urls: Array<string>
                vmaf: number
                quality_type: string
                format: string
                avg_bitrate: number
                size: number
                ssim: number
                height: number
                audio_channels: number
                hdrType: number
                weight: number
                width: number
                audio_duration: number
                video_bitrate: number
                psnr: number
                sr: number
                stream_type: number
                video_codec: string
                volume: number
                fps: number
                stream_desc: string
                duration: number
                rotate: number
                opaque1: {
                  amend: string
                  has_soundtrack: string
                  use_pcdn: string
                  pcdn_302_flag: string
                  device_score: string
                  didLoudnorm: string
                  pcdn_supplier: string
                }
                default_stream: number
                video_duration: number
                audio_bitrate: number
                master_url: string
              }>
              h266: Array<any>
              av1: Array<any>
            }
            userLevel: number
          }
        }
        live_photo_file_id?: string
      }>
      title: string
      user: {
        red_id: string
        images: string
        track_duration: number
        followed: boolean
        FStatus: string
        nickname: string
        red_official_verify_type: number
        show_red_official_verify_icon: boolean
        red_official_verified: boolean
        userid: string
      }
      has_music: boolean
      widgets_context: string
      extract_text_enabled: number
      id: string
      geo_info: {
        distance: string
      }
      result_from: string
      interaction_area: {
        type: number
        status: boolean
        text: string
      }
      nice_count: number
      update_time: number
      debug_info_str: string
      niced: boolean
      corner_tag_info: Array<{
        location: number
        type?: string
        icon?: string
        text?: string
        text_en?: string
        style: number
        poi_id?: string
      }>
      advanced_widgets_groups: {
        groups: Array<{
          mode: number
          fetch_types: Array<string>
        }>
      }
      note_attributes: Array<any>
      collected_count: number
      type: string
      collected: boolean
      comments_count: number
      liked: boolean
      at_user_list?: Array<{
        nickname: string
        user_id: string
        user_oid: string
      }>
    }
    ads?: {
      model_type: string
      note: {
        user: {
          nickname: string
          red_official_verify_type: number
          show_red_official_verify_icon: boolean
          FStatus: string
          red_id: string
          images: string
          red_official_verified: boolean
          userid: string
          track_duration: number
        }
        debug_info_str: string
        nice_count: number
        collected_count: number
        timestamp: number
        last_update_time: number
        update_time: number
        collected: boolean
        liked: boolean
        recommend: {
          chapter_time: number
          track_id: string
        }
        has_music: boolean
        corner_tag_info: Array<{
          text_en: string
          location: number
          type: string
          text: string
        }>
        widgets_context: string
        interaction_area: {
          type: number
          status: boolean
          text: string
        }
        title: string
        liked_count: number
        niced: boolean
        comments_count: number
        desc: string
        type: string
        note_attributes: Array<any>
        advanced_widgets_groups: {
          groups: Array<{
            mode: number
            fetch_types: Array<string>
          }>
        }
        tag_info: {
          type: string
          title: string
        }
        images_list: Array<{
          width: number
          url: string
          url_size_large: string
          original: string
          trace_id: string
          need_load_original_image: boolean
          fileid: string
          height: number
        }>
        result_from: string
        shared_count: number
        id: string
        cover_image_index: number
      }
      track_url: string
      extra_json: string
      widgets_fallback: {
        ads_engage_bar: {
          dynamic_card_info: {
            action_type: string
            engagebar_extra_info: {
              is_ads_invite: boolean
              live_auto_subscribe: boolean
              third_party: string
            }
            engagebar_style: {
              avatar_dot_offset_x: number
              avatar_dot_offset_y: number
              avatar_dot_size: number
              bg_color_of_dark: string
              bg_color_of_light: string
              icon_right_margin: string
              icon_size: string
              image_corner: string
              show_light_anim: number
              sub_title_color_of_dark: string
              sub_title_color_of_light: string
              subtitle_typeface: string
              title_color_of_dark: string
              title_color_of_light: string
            }
            image: string
            link: string
            second_jump_type: number
            subtitle: string
            title: string
            track: {
              card_type: string
              live_status: number
              online_status: number
            }
          }
        }
      }
      track_id: string
      show_tag: boolean
      is_tracking: boolean
      second_jump_type: number
      ad_tag: string
      second_jump_style: string
      ads_id: string
    }
  }>
  query_type: number
  query_intent: {
    goodsIntent: number
    search_ask_intent: boolean
    low_supply_intent: boolean
  }
  is_broad_query: boolean
  search_dqa_new_page_exp: number
  dqa_authorized_user_by_shared: boolean
  query_debug_info: {
    is_forbidden: boolean
  }
  search_pull_down_opt_exp: number
  service_status: string
  strategy_info: {
    query_can_guide_to_feed: boolean
    query_average_impression_count: number
  }
}>

export type TikHubNote = TikHubRoot<{
  noteId: string
  noteLink: string
  userId: string
  headPhoto: any
  name: any
  redId: any
  type: number
  atUserList: any
  title: string
  content: string
  imagesList: Array<{
    fileId: string
    url: string
    original: string
    width: number
    height: number
    latitude: any
    longitude: any
    traceId: string
    sticker: any
  }>
  videoInfo: any
  time: {
    createTime: number
    updateTime: number
    userUpdateTime: number
  }
  createTime: string
  impNum: number
  likeNum: number
  favNum: number
  cmtNum: number
  readNum: number
  shareNum: number
  followCnt: number
  reportBrandUserId: any
  reportBrandName: any
  featureTags: any
  userInfo: {
    nickName: string
    avatar: string
    userId: string
    advertiserId: any
    fansNum: number
    cooperType: number
    priceState: any
    pictureState: any
    picturePrice: any
    videoState: any
    videoPrice: any
    userType: number
    operateState: any
    currentLevel: any
    location: string
    contentTags: Array<any>
    featureTags: Array<any>
    personalTags: Array<any>
    gender: string
    isCollect: boolean
    clickMidNum: number
    interMidNum: number
    pictureInCart: any
    videoInCart: any
    kolType: any
    mEngagementNum: number
  }
  compClickData: any
}>


export class XiaoHongShu {
  public baseUrl = process.env.TIKHUB_API_URL || 'https://api.tikhub.io'
  public apiKey = process.env.TIKHUB_API_KEY || ''

  public async getNotesByKeyword(keyword: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/xiaohongshu/app/search_notes?keyword=${keyword}&page=1&filter_note_type=普通笔记`, {
      headers: {
        // bearer token
        Authorization: `Bearer ${this.apiKey}`
      }
    })
    const data = await response.json() as TikHubNotes
    // 随机选择5条笔记
    const randomNotes = data.data.data.items.sort(() => Math.random() - 0.5).slice(0, 5)
    // 获取5条笔记的noteId
    const noteIds = randomNotes.map(item => item.note?.id)
    // 获取5条笔记的desc
    const notes = await Promise.all(noteIds.map(noteId => this.getNotesByNoteId(noteId)))
    return notes.map(note => note.content)
  }

  public async getNotesByNoteId(noteId: string | number) {
    console.log(`request noteId: ${noteId}`)
    const response = await fetch(`${this.baseUrl}/api/v1/xiaohongshu/app/get_note_info_v2?note_id=${noteId}`, {
      headers: {
        // bearer token
        Authorization: `Bearer ${this.apiKey}`
      }
    })
    const data = await response.json() as TikHubNote
    return data.data.data
  }
}
