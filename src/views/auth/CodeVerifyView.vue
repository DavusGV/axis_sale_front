<script setup lang="ts">
import { IconArrowLeft } from '@tabler/icons-vue'
import { ref } from 'vue'
import VOtpInput from 'vue3-otp-input'
const otp = ref('')
</script>

<template>
  <div
    class="min-h-screen grid grid-cols-12 gap-5 relative xxl:after:absolute xxl:after:w-1/2 py-10 lg:py-20 after:h-full xxl:after:bg-primary/5 lg:dark:after:bg-bg3 ltr:after:left-0 rtl:after:right-0 after:top-0">
    <div class="col-span-12 lg:col-span-5 xxl:col-span-6 flex items-center justify-center">
      <img src="/images/forgot-pass.png" class="relative z-[2] px-4" alt="img" :width="696" :height="648" />
    </div>
    <div class="col-span-12 lg:col-span-7 xxl:col-span-6 flex items-center justify-center px-5 md:px-10">
      <div class="box xl:p-4 mx-3">
        <div class="box bg-primary/5 dark:bg-bg3 lg:p-6 xl:p-8 max-w-[696px]">
          <h3 class="h3 mb-4">Verify Your Phone Number</h3>
          <p class="mb-6 pb-6 bb-dashed">
            A 6 digit One Time Password (OTP) has been sent to your given email address which will
            expire in 15 minutes, after which you will need to resend the code.
          </p>

          <label for="number" class="md:text-lg font-medium block mb-4"> Enter OTP Here </label>
          <v-otp-input v-model="otp" :value="otp" containerStyle="flex gap-1 sm:gap-2 xl:gap-3 xxxl:gap-4"
            input-classes="py-2 px-2 lg:px-5 rounded-lg lg:rounded-[30px] !w-8 xl:!w-12 sm:!w-16 xxl:!w-20 bg-n0 xxxl:!w-24 dark:bg-bg4 inline-block focus:outline-none"
            :numInputs="6" separator="&nbsp;&nbsp;" inputType="number" />
          <button class="mb-2 font-semibold mt-6 lg:mt-10">Resend Code</button>
          <div class="my-5 lg:my-8">
            <button class="btn">Submit Now</button>
          </div>
          <button class="flex items-center gap-1">
            <IconArrowLeft /> Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
