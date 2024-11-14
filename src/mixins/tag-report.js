import _ from 'lodash'
import XLSX from 'xlsx'
import { remote } from 'electron'

const dialog = remote.dialog

export default {

  computed: {

    fileName () {
      console.log(this.reportType)
      if (this.reportType === 'Success') {
        return 'Tagging Success'
      } else if (this.reportType === 'Failed') {
        return 'Tagging Failed'
      } else {
        return 'Tagging'
      }
    }
  },

  methods: {

    saveReport (response, fileName) {
      const wsname = 'Report'

      this.loading = false

      let sno = 1
      const data = [
        ['SNO', 'Permit No', 'Vehicle No', 'Status', 'Reason']
      ]

      _.each(response, (doc) => {
        data.push([sno++, doc.permit_number, doc.truck_number, doc.success ? 'Success' : 'Failed', doc.reason])
      })

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(data)

      /* add worksheet to workbook */
      XLSX.utils.book_append_sheet(wb, ws, wsname)

      console.log('before dialog', `${this.permit.permit_number} ${fileName}.xlsx`, response.length)

      const filename = dialog.showSaveDialogSync({ defaultPath: `${this.permit.permit_number} ${fileName}.xlsx` })

      console.log('output filename', filename)

      /* write workbook */
      XLSX.writeFile(wb, filename)

      console.log('setting loading false')
      this.result = 'Success'
    },

    successDownload () {
      const tagged = Object.keys(this.permit.tagged).filter(t => !this.permit.tagged[t])
      return tagged.map(t => ({
        success: true,
        reason: this.permit.tagged[t],
        permit_number: this.permit.permit_number,
        truck_number: t
      }))
    },

    failedDownload () {
      const tagged = Object.keys(this.permit.tagged).filter(t => this.permit.tagged[t])
      return tagged.map(t => ({
        success: false,
        reason: this.permit.tagged[t],
        permit_number: this.permit.permit_number,
        truck_number: t
      }))
    },

    totalDownload () {
      const out = this.failedDownload()
      console.log(out)
      return out.concat(this.successDownload())
    }

  }
}
